import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { createReservation } from "./actions";

export default async function CustomerInfoPage({
  params,
  searchParams,
}: {
  params: Promise<{ menuId: string }>;
  searchParams: Promise<{ staffId?: string; start?: string; nominated?: string }>;
}) {
  const { menuId } = await params;
  const { staffId, start, nominated } = await searchParams;

  const menu = await prisma.menu.findUnique({ where: { id: BigInt(menuId) } });
  if (!menu || !staffId || !start) notFound();

  const startDate = new Date(start);
  const jstDisplay = new Date(startDate.getTime() + 9 * 60 * 60000);
  const dateLabel = `${jstDisplay.getUTCMonth() + 1}月${jstDisplay.getUTCDate()}日 ${String(
    jstDisplay.getUTCHours()
  ).padStart(2, "0")}:${String(jstDisplay.getUTCMinutes()).padStart(2, "0")}`;

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">{menu.title}</p>
        <h1
          className="mt-2 text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          お客様情報の入力
        </h1>
        <p className="mt-4 text-[#5C5348]">{dateLabel} 〜のご予約です。</p>

        <form action={createReservation} className="mt-10 flex flex-col gap-6">
          <input type="hidden" name="menuId" value={menu.id.toString()} />
          <input type="hidden" name="staffId" value={staffId} />
          <input type="hidden" name="start" value={start} />
          <input type="hidden" name="durationMinutes" value={menu.durationMinutes} />
          <input type="hidden" name="nominated" value={nominated ?? "0"} />

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">お名前</span>
            <input
              type="text"
              name="name"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
              placeholder="山田 花子"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">電話番号</span>
            <input
              type="tel"
              name="phone"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
              placeholder="090-1234-5678"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">メールアドレス（任意）</span>
            <input
              type="email"
              name="email"
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
              placeholder="example@mail.com"
            />
          </label>

          <button
            type="submit"
            className="mt-4 rounded bg-[#2A2522] py-4 text-center text-white transition-opacity hover:opacity-90"
          >
            この内容で予約する
          </button>
        </form>
      </div>
    </main>
  );
}