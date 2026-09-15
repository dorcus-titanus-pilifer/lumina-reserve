import { prisma } from "@/lib/prisma";
import { createManualReservation } from "./actions";

export default async function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; staffId?: string; error?: string }>;
}) {
  const { date, staffId, error } = await searchParams;
  const targetDate = date ?? new Date().toISOString().slice(0, 10);

  const staffList = await prisma.user.findMany({
    where: { isActive: true },
    orderBy: { id: "asc" },
  });
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          手動予約登録
        </h1>
        <p className="mt-4 text-[#5C5348]">電話・店頭でのご予約を登録します。</p>

        {error && (
          <p className="mt-4 rounded bg-red-50 px-4 py-3 text-sm text-red-600">
            {decodeURIComponent(error)}
          </p>
        )}

        <form action={createManualReservation} className="mt-10 flex flex-col gap-5">
          <input type="hidden" name="date" value={targetDate} />

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">日付</span>
            <input
              type="date"
              name="workDate"
              defaultValue={targetDate}
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">開始時刻</span>
            <input
              type="time"
              name="startTime"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">担当スタッフ</span>
            <select
              name="staffId"
              defaultValue={staffId}
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            >
              {staffList.map((s) => (
                <option key={s.id.toString()} value={s.id.toString()}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">メニュー</span>
            <select
              name="menuId"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            >
              {menus.map((m) => (
                <option key={m.id.toString()} value={m.id.toString()}>
                  {m.title}（{m.durationMinutes}分）
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">お客様名</span>
            <input
              type="text"
              name="customerName"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">電話番号</span>
            <input
              type="tel"
              name="customerPhone"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" name="isNominated" value="1" />
            <span className="text-sm text-[#5C5348]">指名あり</span>
          </label>

          <button
            type="submit"
            className="mt-4 rounded bg-[#2A2522] py-4 text-center text-white transition-opacity hover:opacity-90"
          >
            登録する
          </button>
        </form>
      </div>
    </main>
  );
}