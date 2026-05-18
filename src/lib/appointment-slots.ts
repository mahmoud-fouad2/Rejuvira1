const OPEN_MINUTES = 14 * 60;
const CLOSE_MINUTES = 22 * 60;
const SLOT_STEP_MINUTES = 30;
const FRIDAY_DAY = 5;

export type AppointmentDateOption = {
  value: string;
  labelAr: string;
  labelEn: string;
};

export type AppointmentTimeOption = {
  value: string;
  labelAr: string;
  labelEn: string;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatArabicDate(date: Date) {
  return new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);
}

function formatEnglishDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTimeLabel(hour24: number, minute: number, lang: "ar" | "en") {
  const periodAr = hour24 < 12 ? "ص" : "م";
  const periodEn = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 || 12;
  const minuteText = pad(minute);
  return lang === "ar"
    ? `${hour12}:${minuteText} ${periodAr}`
    : `${hour12}:${minuteText} ${periodEn}`;
}

export const APPOINTMENT_TIME_OPTIONS: AppointmentTimeOption[] = Array.from(
  { length: (CLOSE_MINUTES - OPEN_MINUTES) / SLOT_STEP_MINUTES + 1 },
  (_, index) => {
    const total = OPEN_MINUTES + index * SLOT_STEP_MINUTES;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return {
      value: `${pad(hour)}:${pad(minute)}`,
      labelAr: formatTimeLabel(hour, minute, "ar"),
      labelEn: formatTimeLabel(hour, minute, "en"),
    };
  },
);

export function buildAppointmentDateOptions(
  daysAhead = 45,
  now = new Date(),
): AppointmentDateOption[] {
  const options: AppointmentDateOption[] = [];
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + offset);
    if (date.getDay() === FRIDAY_DAY) continue;
    options.push({
      value: toDateValue(date),
      labelAr: formatArabicDate(date),
      labelEn: formatEnglishDate(date),
    });
  }

  return options;
}

export function isValidAppointmentSlot(date?: string, time?: string): boolean {
  if (!date) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const [year = 0, month = 0, day = 0] = date.split("-").map(Number);
  const parsedDate = new Date(year, month - 1, day);
  if (Number.isNaN(parsedDate.getTime())) return false;
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return false;
  }
  if (parsedDate.getDay() === FRIDAY_DAY) return false;

  if (!time) return true;
  if (!/^\d{2}:\d{2}$/.test(time)) return false;
  const [hour = 0, minute = 0] = time.split(":").map(Number);
  const total = hour * 60 + minute;
  return (
    total >= OPEN_MINUTES &&
    total <= CLOSE_MINUTES &&
    (total - OPEN_MINUTES) % SLOT_STEP_MINUTES === 0
  );
}

export function parsePreferredAppointment(date?: string, time?: string) {
  if (!date || !isValidAppointmentSlot(date, time)) return undefined;
  const parsed = new Date(`${date}T${time || "14:00"}:00+03:00`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}
