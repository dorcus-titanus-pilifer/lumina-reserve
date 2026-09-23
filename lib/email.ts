import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(to: string, params: {
  customerName: string;
  menuTitle: string;
  staffName: string;
  dateLabel: string;
}) {
  const { customerName, menuTitle, staffName, dateLabel } = params;

  await resend.emails.send({
    from: "Lumina <onboarding@resend.dev>",
    to,
    subject: "【Lumina】明日のご予約のリマインド",
    html: `
      <p>${customerName} 様</p>
      <p>明日、Hair &amp; Beauty Salon Lumina にてご予約をお待ちしております。</p>
      <ul>
        <li>日時：${dateLabel}</li>
        <li>メニュー：${menuTitle}</li>
        <li>担当：${staffName}</li>
      </ul>
      <p>ご不明点がございましたら、お気軽にお問い合わせください。</p>
    `,
  });
}