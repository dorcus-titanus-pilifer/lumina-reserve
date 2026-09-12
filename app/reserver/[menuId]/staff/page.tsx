import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function StaffSelectPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;

  let menu;
  try {
    menu = await prisma.menu.findUnique({ where: { id: BigInt(menuId) } });
  } catch {
    notFound();
  }

  if (!menu) {
    notFound();
  }

  const staffMenus = await prisma.staffMenu.findMany({
    where: { menuId: menu.id },
    include: { user: true },
  });

  const staffList = staffMenus.map((sm) => sm.user).filter((u) => u.isActive);

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">{menu.title}</p>
        <h1
          className="mt-2 text-3xl font-medium sm:text-4xl"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          担当スタッフを選ぶ
        </h1>
        <p className="mt-4 text-[#5C5348]">
          ご希望のスタッフをお選びください。指名がない場合は「指名なし」からお進みいただけます。
        </p>

        <div className="mt-10 flex flex-col divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
          <Link
            href={`/reserve/${menu.id}/datetime?staffId=none`}
            className="flex items-center justify-between py-5 text-left transition-colors hover:bg-[#F1ECE2]"
          >
            <span className="text-lg">指名なし（空いているスタッフにおまかせ）</span>
          </Link>

          {staffList.map((staff) => (
            <Link
              key={staff.id.toString()}
              href={`/reserve/${menu.id}/datetime?staffId=${staff.id}`}
              className="flex items-center justify-between py-5 text-left transition-colors hover:bg-[#F1ECE2]"
            >
              <span className="text-lg">{staff.name}</span>
              {staff.nominationFee > 0 && (
                <span className="text-sm text-[#8A8073]">
                  指名料 ¥{staff.nominationFee.toLocaleString()}
                </span>
              )}
            </Link>
          ))}
        </div>

        {staffList.length === 0 && (
          <p className="mt-10 text-sm text-[#8A8073]">
            現在このメニューに対応可能なスタッフがいません。
          </p>
        )}

        <Link href="/" className="mt-8 inline-block text-sm text-[#7C6A54] underline">
          ← メニュー選択に戻る
        </Link>
      </div>
    </main>
  );
}