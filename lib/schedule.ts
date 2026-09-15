export const JST_OFFSET_HOURS = 9;

// シフトのTime型フィールド（JSTの見た目の時刻）を、指定日のUTC時刻に変換する
export function combineDateAndTime(date: Date, time: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      time.getUTCHours() - JST_OFFSET_HOURS,
      time.getUTCMinutes(),
      0,
      0
    )
  );
}

// UTC時刻を「HH:MM」の日本時間表示に変換する
export function formatTime(d: Date): string {
  const jst = new Date(d.getTime() + JST_OFFSET_HOURS * 60 * 60000);
  const hh = String(jst.getUTCHours()).padStart(2, "0");
  const mm = String(jst.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

// Dateを「YYYY-MM-DD」の日本時間の日付文字列に変換する
export function formatDateJST(d: Date): string {
  const jst = new Date(d.getTime() + JST_OFFSET_HOURS * 60 * 60000);
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "YYYY-MM-DD"文字列から、その日本時間の1日ぶんのUTC範囲を求める
export function getJstDayRange(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d) - JST_OFFSET_HOURS * 60 * 60000);
  const end = new Date(start.getTime() + 24 * 60 * 60000);
  return { start, end };
}

// "YYYY-MM-DD"文字列から、シフトのworkDate(DATE型)を検索するためのUTC範囲を求める
export function getShiftDateRange(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const start = new Date(Date.UTC(y, m - 1, d));
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}