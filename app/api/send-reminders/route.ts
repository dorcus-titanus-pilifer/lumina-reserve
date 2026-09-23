import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/email";
import { formatTime, getJstDayRange, formatDateJST } from "@/lib/schedule";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 「明日」の日付範囲を計算
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60000);
  const tomorrowStr = formatDateJST(tomorrow);
  const { start, end } = getJstDayRange(tomorrowStr);

  const reservations = await prisma.reservation.findMany({
    where: {
      startTime: { gte: start, lt: end },
      status: "CONFIRMED",
      reminderSentAt: null,
    },
    include: { customer: true, menu: true, staff: true },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const r of reservations) {
    if (!r.customer.email) continue;

    try {
      await sendReminderEmail(r.customer.email, {
        customerName: r.customer.name,
        menuTitle: r.menu.title,
        staffName: r.staff.name,
        dateLabel: `${tomorrowStr} ${formatTime(r.startTime)}`,
      });

      await prisma.reservation.update({
        where: { id: r.id },
        data: { reminderSentAt: new Date() },
      });

      sentCount++;
    } catch (e) {
      errors.push(`予約ID ${r.id}: ${e instanceof Error ? e.message : "不明なエラー"}`);
    }
  }

  return NextResponse.json({
    target_date: tomorrowStr,
    total_candidates: reservations.length,
    sent: sentCount,
    errors,
  });
}