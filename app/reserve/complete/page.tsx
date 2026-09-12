import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CompletePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) notFound();

  const reservation = await prisma.reservation.findUnique({
    where: { id: BigInt(id) },
    include: { menu: true, staff: true, customer: true },
  });

  if (!reservation) notFound();

  const jstStart = new Date(reservation.startTime.getTime() + 9 * 60 * 60000);
  const dateLabel = `${jstStart.getUTCMonth() + 1}月${jstStart.getUTCDate()}日 ${String(
    jstStart.getUTCHours()
  ).padStart(2, "0")}:${String(jstStart.getUTCMinutes()).padStart(2, "0")}`;

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina</p>
        <h1
          className="mt-2 text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ご予約が完了しました
        </h1>
        <p className="mt-4 text-[#5C5348]">
          {reservation.customer.name} 様のご予約を承りました。
        </p>

        <div className="mt-10 flex flex-col gap-3 rounded border border-[#E4DDD0] p-6 text-left">
          <div className="flex justify-between">
            <span className="text-[#8A8073]">メニュー</span>
            <span>{reservation.menu.title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8073]">担当</span>
            <span>{reservation.staff.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#8A8073]">日時</span>
            <span>{dateLabel}</span>
          </div>
        </div>

        <Link href="/" className="mt-10 inline-block text-sm text-[#7C6A54] underline">
          トップページへ戻る
        </Link>
      </div>
    </main>
  );
}