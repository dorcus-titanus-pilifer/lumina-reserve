import { prisma } from "@/lib/prisma";
import { formatDateJST, getShiftDateRange } from "@/lib/schedule";
import Link from "next/link";
import { createShift, deleteShift } from "./actions";

function addDays(dateStr: string, diff: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + diff);
  return formatDateJST(date);
}

function formatShiftTime(d: Date): string {
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default async function ShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const { start } = await searchParams;
  const weekStart = start ?? formatDateJST(new Date());

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const { start: rangeStart } = getShiftDateRange(weekDates[0]);
  const { end: rangeEnd } = getShiftDateRange(weekDates[6]);

  const staffList = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });

  const shifts = await prisma.shift.findMany({
    where: { workDate: { gte: rangeStart, lt: rangeEnd } },
    orderBy: { workDate: "asc" },
  });

  const shiftMap = new Map<string, typeof shifts>();
  for (const shift of shifts) {
    const key = `${shift.staffId}_${formatDateJST(
      new Date(shift.workDate.getTime() + 9 * 60 * 60000)
    )}`;
    if (!shiftMap.has(key)) shiftMap.set(key, []);
    shiftMap.get(key)!.push(shift);
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          スタッフ・シフト管理
        </h1>

        <div className="mt-6 flex items-center gap-4">
          <Link
            href={`/admin/shifts?start=${addDays(weekStart, -7)}`}
            className="text-sm text-[#7C6A54] underline"
          >
            ← 前週
          </Link>
          <span className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            {weekDates[0]} 〜 {weekDates[6]}
          </span>
          <Link
            href={`/admin/shifts?start=${addDays(weekStart, 7)}`}
            className="text-sm text-[#7C6A54] underline"
          >
            翌週 →
          </Link>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border border-[#E4DDD0] p-2 text-left">スタッフ</th>
                {weekDates.map((d) => (
                  <th key={d} className="border border-[#E4DDD0] p-2">
                    {d.slice(5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff.id.toString()}>
                  <td className="border border-[#E4DDD0] p-2 font-medium">{staff.name}</td>
                  {weekDates.map((d) => {
                    const key = `${staff.id}_${d}`;
                    const dayShifts = shiftMap.get(key) ?? [];
                    return (
                      <td key={d} className="border border-[#E4DDD0] p-2 text-center align-top">
                        {dayShifts.map((s) => (
                          <form key={s.id.toString()} action={deleteShift} className="mb-1">
                            <input type="hidden" name="shiftId" value={s.id.toString()} />
                            <button
                              type="submit"
                              className="w-full rounded bg-[#F1ECE2] px-1 py-1 text-xs hover:bg-red-50"
                              title="クリックで削除"
                            >
                              {formatShiftTime(s.startTime)}-{formatShiftTime(s.endTime)}
                            </button>
                          </form>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-10 rounded border border-[#E4DDD0] p-6">
          <h2 className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
            シフトを追加
          </h2>
          <form action={createShift} className="mt-4 flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[#8A8073]">スタッフ</span>
              <select name="staffId" required className="rounded border border-[#E4DDD0] px-3 py-2">
                {staffList.map((s) => (
                  <option key={s.id.toString()} value={s.id.toString()}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[#8A8073]">日付</span>
              <input
                type="date"
                name="workDate"
                defaultValue={weekDates[0]}
                required
                className="rounded border border-[#E4DDD0] px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[#8A8073]">開始</span>
              <input
                type="time"
                name="startTime"
                defaultValue="10:00"
                required
                className="rounded border border-[#E4DDD0] px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-[#8A8073]">終了</span>
              <input
                type="time"
                name="endTime"
                defaultValue="19:00"
                required
                className="rounded border border-[#E4DDD0] px-3 py-2"
              />
            </label>
            <button
              type="submit"
              className="rounded bg-[#2A2522] px-4 py-2 text-sm text-white"
            >
              追加
            </button>
          </form>
        </div>

        <Link href="/admin" className="mt-10 inline-block text-sm text-[#7C6A54] underline">
          ← 管理画面トップへ戻る
        </Link>
      </div>
    </main>
  );
}