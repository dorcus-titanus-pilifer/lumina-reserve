import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { createHoliday, deleteHoliday } from "./actions";

export default async function HolidaysPage() {
  const holidays = await prisma.shopHoliday.findMany({
    where: { holidayDate: { gte: new Date() } },
    orderBy: { holidayDate: "asc" },
  });

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          定休日・臨時休業設定
        </h1>

        <form action={createHoliday} className="mt-8 flex flex-wrap items-end gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#8A8073]">日付</span>
            <input
              type="date"
              name="holidayDate"
              required
              className="rounded border border-[#E4DDD0] px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-[#8A8073]">理由（任意）</span>
            <input
              type="text"
              name="description"
              placeholder="定休日 / 夏季休暇 など"
              className="rounded border border-[#E4DDD0] px-3 py-2"
            />
          </label>
          <button type="submit" className="rounded bg-[#2A2522] px-4 py-2 text-sm text-white">
            追加
          </button>
        </form>

        <div className="mt-10 flex flex-col divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
          {holidays.map((h) => (
            <div key={h.id.toString()} className="flex items-center justify-between py-4">
              <span>
                {h.holidayDate.toISOString().slice(0, 10)}
                {h.description && (
                  <span className="ml-3 text-sm text-[#8A8073]">{h.description}</span>
                )}
              </span>
              <form action={deleteHoliday}>
                <input type="hidden" name="id" value={h.id.toString()} />
                <button type="submit" className="text-sm text-red-600 underline">
                  削除
                </button>
              </form>
            </div>
          ))}
          {holidays.length === 0 && (
            <p className="py-4 text-sm text-[#8A8073]">登録されている休業日はありません。</p>
          )}
        </div>

        <Link href="/admin" className="mt-10 inline-block text-sm text-[#7C6A54] underline">
          ← 管理画面トップへ戻る
        </Link>
      </div>
    </main>
  );
}