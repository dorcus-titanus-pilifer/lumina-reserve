import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

const SLOT_INTERVAL_MINUTES = 30;
const JST_OFFSET_HOURS = 9;

function combineDateAndTime(date: Date, time: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.getUTCHours() - JST_OFFSET_HOURS,
      time.getUTCMinutes(),
      0,
      0
    )
  );
}

function formatTime(d: Date): string {
  const jst = new Date(d.getTime() + JST_OFFSET_HOURS * 60 * 60000);
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mm = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function generateAvailableSlots(
  shiftStart: Date,
  shiftEnd: Date,
  durationMinutes: number,
  busyRanges: { start: Date; end: Date }[]
): Date[] {
  const slots: Date[] = [];
  let current = new Date(shiftStart);

  while (true) {
    const slotEnd = new Date(current.getTime() + durationMinutes * 60000);
    if (slotEnd > shiftEnd) break;

    const overlaps = busyRanges.some((b) => current < b.end && slotEnd > b.start);
    if (!overlaps) {
      slots.push(new Date(current));
    }
    current = new Date(current.getTime() + SLOT_INTERVAL_MINUTES * 60000);
  }

  return slots;
}

export default async function DateTimeSelectPage({
  params,
  searchParams,
}: {
  params: Promise<{ menuId: string }>;
  searchParams: Promise<{ staffId?: string }>;
}) {
  const { menuId } = await params;
  const { staffId } = await searchParams;

  const menu = await prisma.menu.findUnique({ where: { id: BigInt(menuId) } });
  if (!menu || !staffId) notFound();

  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const targetDate = new Date(
    Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate())
  );
  const nextDate = new Date(targetDate);
  nextDate.setUTCDate(nextDate.getUTCDate() + 1);

  let candidateStaffIds: bigint[];
  if (staffId === "none") {
    const staffMenus = await prisma.staffMenu.findMany({
      where: { menuId: menu.id },
      include: { user: true },
    });
    candidateStaffIds = staffMenus.filter((sm) => sm.user.isActive).map((sm) => sm.userId);
  } else {
    candidateStaffIds = [BigInt(staffId)];
  }

  const shifts = await prisma.shift.findMany({
    where: {
      staffId: { in: candidateStaffIds },
      workDate: { gte: targetDate, lt: nextDate },
    },
  });

  const reservations = await prisma.reservation.findMany({
    where: {
      staffId: { in: candidateStaffIds },
      status: "CONFIRMED",
      startTime: { gte: targetDate, lt: nextDate },
    },
  });

  const slotMap = new Map<number, { time: Date; staffId: bigint }>();

  for (const shift of shifts) {
    const shiftStart = combineDateAndTime(targetDate, shift.startTime);
    const shiftEnd = combineDateAndTime(targetDate, shift.endTime);
    const busyRanges = reservations
      .filter((r) => r.staffId === shift.staffId)
      .map((r) => ({ start: r.startTime, end: r.endTime }));

    const slots = generateAvailableSlots(shiftStart, shiftEnd, menu.durationMinutes, busyRanges);

    for (const slot of slots) {
      const key = slot.getTime();
      if (!slotMap.has(key)) {
        slotMap.set(key, { time: slot, staffId: shift.staffId });
      }
    }
  }

  const sortedSlots = Array.from(slotMap.values()).sort(
    (a, b) => a.time.getTime() - b.time.getTime()
  );

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">{menu.title}</p>
        <h1
          className="mt-2 text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          日時を選ぶ
        </h1>
        <p className="mt-4 text-[#5C5348]">
          {tomorrow.getMonth() + 1}月{tomorrow.getDate()}日の空き時間
        </p>

        <div className="mt-10 grid grid-cols-3 gap-3">
          {sortedSlots.map(({ time, staffId: sId }) => (
            <Link
              key={time.getTime()}
              href={`/reserve/${menu.id}/customer?staffId=${sId}&start=${time.toISOString()}&nominated=${staffId === "none" ? "0" : "1"}`}
              className="rounded border border-[#E4DDD0] py-3 text-center transition-colors hover:bg-[#F1ECE2]"
            >
              {formatTime(time)}
            </Link>
          ))}
        </div>

        {sortedSlots.length === 0 && (
          <p className="mt-10 text-sm text-[#8A8073]">
            この日はご案内できる空き時間がありません。
          </p>
        )}

        <Link
          href={`/reserve/${menu.id}/staff`}
          className="mt-8 inline-block text-sm text-[#7C6A54] underline"
        >
          ← スタッフ選択に戻る
        </Link>
      </div>
    </main>
  );
}