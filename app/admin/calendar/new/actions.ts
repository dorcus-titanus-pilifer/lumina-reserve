"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { createReservationCore, ReservationConflictError } from "@/lib/reservation";
import { redirect } from "next/navigation";

export async function createManualReservation(formData: FormData) {
  const workDate = formData.get("workDate") as string;
  const startTimeStr = formData.get("startTime") as string; // "HH:MM"
  const staffId = BigInt(formData.get("staffId") as string);
  const menuId = BigInt(formData.get("menuId") as string);
  const customerName = formData.get("customerName") as string;
  const customerPhone = formData.get("customerPhone") as string;
  const isNominated = formData.get("isNominated") === "1";

  const menu = await prisma.menu.findUnique({ where: { id: menuId } });
  if (!menu) {
    redirect(`/admin/calendar/new?error=${encodeURIComponent("メニューが見つかりません")}`);
  }

  const [hh, mm] = startTimeStr.split(":").map(Number);
  const [y, m, d] = workDate.split("-").map(Number);
  const startTime = new Date(Date.UTC(y, m - 1, d, hh - 9, mm, 0, 0));
  const endTime = new Date(startTime.getTime() + menu!.durationMinutes * 60000);

  // ログイン中のスタッフ（＝誰が代理入力したか）を記録する
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const staffUser = authUser?.email
    ? await prisma.user.findFirst()
    : null;

  try {
    await createReservationCore({
      customerName,
      customerPhone,
      menuId,
      staffId,
      startTime,
      endTime,
      isNominated,
      source: "STORE",
      createdByUserId: staffUser?.id,
    });
  } catch (e) {
    if (e instanceof ReservationConflictError) {
      redirect(
        `/admin/calendar/new?date=${workDate}&staffId=${staffId}&error=${encodeURIComponent(e.message)}`
      );
    }
    throw e;
  }

  redirect(`/admin/calendar?date=${workDate}`);
}