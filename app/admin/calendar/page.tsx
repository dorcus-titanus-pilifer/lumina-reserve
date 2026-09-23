import { prisma } from "@/lib/prisma";
import { formatTime, formatDateJST, getJstDayRange, getShiftDateRange } from "@/lib/schedule";
import Link from "next/link";
import { updateReservationStatus } from "./actions";

function addDays(dateStr: string, diff: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + diff);
  return formatDateJST(date);
}

export default async function AdminCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const targetDate = date ?? formatDateJST(new Date());

  const { start: dayStart, end: dayEnd } = getJstDayRange(targetDate);
  const { start: shiftStart, end: shiftEnd } = getShiftDateRange(targetDate);

  const staffList = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  const shifts = await prisma.shift.findMany({
    where: { workDate: { gte: shiftStart, lt: shiftEnd } },
  });

  const reservations = await prisma.reservation.findMany({
    where: {
      startTime: { gte: dayStart, lt: dayEnd },
    },
    include: { customer: true, menu: true, staff: true },
    orderBy: { startTime: "asc" },
  });

  const shiftStaffIds = new Set(shifts.map((s) => s.staffId.toString()));

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          予約カレンダー
        </h1>

        <Link
          href={`/admin/calendar/new?date=${targetDate}`}
          className="mt-6 inline-block rounded bg-[#2A2522] px-4 py-2 text-sm text-white"
        >
          ＋ 手動で予約を追加
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <Link
            href={`/admin/calendar?date=${addDays(targetDate, -1)}`}
            className="text-sm text-[#7C6A54] underline"
          >
            ← 前日
          </Link>
          <span className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            {targetDate}
          </span>
          <Link
            href={`/admin/calendar?date=${addDays(targetDate, 1)}`}
            className="text-sm text-[#7C6A54] underline"
          >
            翌日 →
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {staffList.map((staff) => {
            const isWorking = shiftStaffIds.has(staff.id.toString());
            const staffReservations = reservations.filter(
              (r) => r.staffId === staff.id
            );

            return (
              <div key={staff.id.toString()} className="rounded border border-[#E4DDD0] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{staff.name}</span>
                  <span className="text-xs text-[#8A8073]">
                    {isWorking ? "出勤" : "休み"}
                  </span>
                </div>

                {staffReservations.length > 0 ? (
                  <div className="mt-3 flex flex-col gap-2">
                    {staffReservations.map((r) => (
                      <div
                        key={r.id.toString()}
                        className="flex flex-col gap-2 rounded bg-[#F1ECE2] px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <span>
                          {formatTime(r.startTime)}〜{formatTime(r.endTime)} {r.menu.title}
                          <span className="ml-2 text-[#8A8073]">
                            {r.customer.name}様（{r.source}）
                          </span>
                        </span>

                        {r.status === "CONFIRMED" ? (
                          <div className="flex gap-2">
                            <form action={updateReservationStatus}>
                              <input type="hidden" name="reservationId" value={r.id.toString()} />
                              <input type="hidden" name="status" value="COMPLETED" />
                              <input type="hidden" name="date" value={targetDate} />
                              <button
                                type="submit"
                                className="rounded bg-green-100 px-2 py-1 text-xs text-green-800"
                              >
                                来店完了
                              </button>
                            </form>
                            <form action={updateReservationStatus}>
                              <input type="hidden" name="reservationId" value={r.id.toString()} />
                              <input type="hidden" name="status" value="NO_SHOW" />
                              <input type="hidden" name="date" value={targetDate} />
                              <button
                                type="submit"
                                className="rounded bg-red-100 px-2 py-1 text-xs text-red-800"
                              >
                                ノーショー
                              </button>
                            </form>
                            <form action={updateReservationStatus}>
                              <input type="hidden" name="reservationId" value={r.id.toString()} />
                              <input type="hidden" name="status" value="CANCELLED" />
                              <input type="hidden" name="date" value={targetDate} />
                              <button
                                type="submit"
                                className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700"
                              >
                                キャンセル
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span
                            className={
                              r.status === "NO_SHOW"
                                ? "text-xs text-red-600"
                                : r.status === "CANCELLED"
                                ? "text-xs text-[#8A8073]"
                                : "text-xs text-green-700"
                            }
                          >
                            {r.status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-[#8A8073]">予約なし</p>
                )}
              </div>
            );
          })}
        </div>

        <Link href="/admin" className="mt-10 inline-block text-sm text-[#7C6A54] underline">
          ← 管理画面トップへ戻る
        </Link>
      </div>
    </main>
  );
}