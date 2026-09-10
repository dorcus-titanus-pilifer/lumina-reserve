import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const menus = await prisma.menu.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">
          Hair &amp; Beauty Salon
        </p>
        <h1
          className="mt-2 text-4xl font-medium sm:text-5xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Lumina
        </h1>
        <p className="mt-4 text-[#5C5348]">
          ご希望のメニューをお選びください。
        </p>

        <div className="mt-10 flex flex-col divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
          {menus.map((menu) => (
            <Link
              key={menu.id.toString()}
              href={`/reserve/${menu.id}/staff`}
              className="flex items-center justify-between py-5 text-left transition-colors hover:bg-[#F1ECE2]"
            >
              <span>
                <span className="block text-lg">{menu.title}</span>
                <span className="mt-1 block text-sm text-[#8A8073]">
                  {menu.durationMinutes}分
                </span>
              </span>
              <span className="text-lg" style={{ fontFamily: "var(--font-heading)" }}>
                ¥{menu.price.toLocaleString()}
              </span>
            </Link>
          ))}
        </div>

        {menus.length === 0 && (
          <p className="mt-10 text-sm text-[#8A8073]">
            現在ご用意できるメニューがありません。
          </p>
        )}
      </div>
    </main>
  );
}