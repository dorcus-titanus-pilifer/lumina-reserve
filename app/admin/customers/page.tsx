import { prisma } from "@/lib/prisma";
import { formatTime } from "@/lib/schedule";
import Link from "next/link";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      reservations: {
        orderBy: { startTime: "desc" },
        include: { menu: true, staff: true },
      },
    },
  });

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          顧客管理
        </h1>

        <div className="mt-10 flex flex-col gap-6">
          {customers.map((customer) => {
            const noShowCount = customer.reservations.filter(
              (r) => r.status === "NO_SHOW"
            ).length;

            return (
              <div key={customer.id.toString()} className="rounded border border-[#E4DDD0] p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium">{customer.name}</span>
                    <span className="ml-3 text-sm text-[#8A8073]">{customer.phone}</span>
                  </div>
                  {noShowCount > 0 && (
                    <span className="rounded bg-red-50 px-2 py-1 text-xs text-red-600">
                      ノーショー {noShowCount}回
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {customer.reservations.slice(0, 5).map((r) => (
                    <div
                      key={r.id.toString()}
                      className="flex items-center justify-between text-sm text-[#5C5348]"
                    >
                      <span>
                        {r.startTime.toISOString().slice(0, 10)} {formatTime(r.startTime)} ・
                        {r.menu.title} ・ {r.staff.name}
                      </span>
                      <span
                        className={
                          r.status === "NO_SHOW"
                            ? "text-red-600"
                            : r.status === "CANCELLED"
                            ? "text-[#8A8073]"
                            : r.status === "COMPLETED"
                            ? "text-green-700"
                            : "text-[#7C6A54]"
                        }
                      >
                        {r.status}
                      </span>
                    </div>
                  ))}
                  {customer.reservations.length === 0 && (
                    <p className="text-sm text-[#8A8073]">予約履歴はありません。</p>
                  )}
                </div>
              </div>
            );
          })}

          {customers.length === 0 && (
            <p className="text-sm text-[#8A8073]">登録されている顧客はいません。</p>
          )}
        </div>

        <Link href="/admin" className="mt-10 inline-block text-sm text-[#7C6A54] underline">
          ← 管理画面トップへ戻る
        </Link>
      </div>
    </main>
  );
}