import { login } from "./actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#FAF8F4] px-6">
      <div className="w-full max-w-sm">
        <p className="text-sm tracking-wide text-[#7C6A54]">Lumina</p>
        <h1
          className="mt-2 text-3xl font-medium"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          管理画面ログイン
        </h1>

        <form action={login} className="mt-10 flex flex-col gap-5">
          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">メールアドレス</span>
            <input
              type="email"
              name="email"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-sm text-[#5C5348]">パスワード</span>
            <input
              type="password"
              name="password"
              required
              className="rounded border border-[#E4DDD0] px-4 py-3 focus:border-[#7C6A54] focus:outline-none"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600">
              メールアドレスまたはパスワードが正しくありません。
            </p>
          )}

          <button
            type="submit"
            className="mt-2 rounded bg-[#2A2522] py-3 text-center text-white transition-opacity hover:opacity-90"
          >
            ログイン
          </button>
        </form>
      </div>
    </main>
  );
}