// "NZD 25,900". Whole dollars only: every amount in the seed data is a whole number.
export function nzd(amount: number): string {
  return `NZD ${amount.toLocaleString("en-NZ")}`;
}

// "15 February 2027". Dates without a time are shown as written; times are shown in New Zealand time.
export function formatDate(iso: string): string {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso);
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: dateOnly ? "UTC" : "Pacific/Auckland",
  }).format(new Date(iso));
}

export function weeks(count: number): string {
  return count === 1 ? "1 week" : `${count} weeks`;
}

// "14 August 2026 at 7:22 pm", in New Zealand time.
export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-NZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Pacific/Auckland",
  }).format(new Date(iso));
}
