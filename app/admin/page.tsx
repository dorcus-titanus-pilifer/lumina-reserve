import { createClient } from "@/lib/supabase/server";
import { logout } from "./logout-action";
import Link from "next/link";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen px-6 py-16 sm:px-12">
      <div className="mx-auto max-w-xl">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina 管理画面</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          ようこそ
        </h1>
        <p className="mt-4 text-[#5C5348]">{user?.email} でログイン中です。</p>

        <div className="mt-10 flex flex-col divide-y divide-[#E4DDD0] border-t border-b border-[#E4DDD0]">
          <Link
            href="/admin/calendar"
            className="py-5 text-lg transition-colors hover:bg-[#F1ECE2]"
          >
            予約カレンダー
          </Link>
          <Link
            href="/admin/shifts"
            className="py-5 text-lg transition-colors hover:bg-[#F1ECE2]"
          >
            スタッフ・シフト管理
          </Link>
          <Link
            href="/admin/holidays"
            className="py-5 text-lg transition-colors hover:bg-[#F1ECE2]"
          >
            定休日・臨時休業設定
          </Link>
          <Link
            href="/admin/customers"
            className="py-5 text-lg transition-colors hover:bg-[#F1ECE2]"
          >
            顧客管理
          </Link>
        </div>

        <form action={logout} className="mt-10">
          <button type="submit" className="text-sm text-[#7C6A54] underline">
            ログアウト
          </button>
        </form>
      </div>
    </main>
  );
}