export const SAUDI_MOBILE_REGEX = /^05[0-9]{8}$/;
export const SAUDI_MOBILE_INPUT_PATTERN =
  "(?:05[0-9]{8}|(?:\\+?9665)[0-9]{8})";
export const SAUDI_MOBILE_INPUT_TITLE =
  "رقم الجوال السعودي يجب أن يكون 10 أرقام بصيغة 05xxxxxxxx.";
export const SAUDI_MOBILE_ERROR_MESSAGE =
  "رقم الجوال السعودي يجب أن يكون 10 أرقام بصيغة 05xxxxxxxx. / Saudi mobile number must be 10 digits like 05xxxxxxxx.";

const ARABIC_INDIC_ZERO = "٠".charCodeAt(0);
const EASTERN_ARABIC_ZERO = "۰".charCodeAt(0);

function toAsciiDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) =>
      String(digit.charCodeAt(0) - ARABIC_INDIC_ZERO),
    )
    .replace(/[۰-۹]/g, (digit) =>
      String(digit.charCodeAt(0) - EASTERN_ARABIC_ZERO),
    );
}

export function normalizeSaudiMobileNumber(value: string) {
  const ascii = toAsciiDigits(value).trim();
  const digits = ascii.replace(/[^\d]/g, "");

  if (digits.startsWith("009665") && digits.length === 14) {
    return `0${digits.slice(5)}`;
  }

  if (digits.startsWith("9665") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  return digits;
}

export function isValidSaudiMobileNumber(value: string) {
  return SAUDI_MOBILE_REGEX.test(normalizeSaudiMobileNumber(value));
}
