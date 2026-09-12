"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function createReservation(formData: FormData) {
  const menuId = BigInt(formData.get("menuId") as string);
  const staffIdRaw = formData.get("staffId") as string;
  const start = formData.get("start") as string;
  const durationMinutes = Number(formData.get("durationMinutes"));
  const isNominated = formData.get("nominated") === "1";
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const email = (formData.get("email") as string) || undefined;

  const startTime = new Date(start);
  const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

  // 顧客を電話番号で名寄せ（既存なら再利用、なければ新規作成）
  const customer = await prisma.customer.upsert({
    where: { phone },
    update: { name, email },
    create: { name, phone, email },
  });

  // 「指名なし」の場合は候補スタッフの中から空いている人を探す
  let staffId: bigint;
  if (staffIdRaw === "none") {
    const staffMenus = await prisma.staffMenu.findMany({
      where: { menuId },
      include: { user: true },
    });
    const candidateIds = staffMenus.filter((sm) => sm.user.isActive).map((sm) => sm.userId);

    const conflicting = await prisma.reservation.findMany({
      where: {
        staffId: { in: candidateIds },
        status: "CONFIRMED",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    const busyStaffIds = new Set(conflicting.map((r) => r.staffId.toString()));
    const available = candidateIds.find((id) => !busyStaffIds.has(id.toString()));

    if (!available) {
      throw new Error("この時間帯は空いているスタッフがいません。お手数ですが別の時間をお選びください。");
    }
    staffId = available;
  } else {
    staffId = BigInt(staffIdRaw);
  }

  // 排他制御：トランザクション内で再度重複チェックしてから作成
  const reservation = await prisma.$transaction(async (tx) => {
    const conflict = await tx.reservation.findFirst({
      where: {
        staffId,
        status: "CONFIRMED",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

    if (conflict) {
      throw new Error("申し訳ございません、ちょうど今この時間帯は埋まってしまいました。");
    }

    return tx.reservation.create({
      data: {
        customerId: customer.id,
        staffId,
        menuId,
        startTime,
        endTime,
        status: "CONFIRMED",
        source: "WEB",
        isNominated,
      },
    });
  });

  redirect(`/reserve/complete?id=${reservation.id.toString()}`);
}