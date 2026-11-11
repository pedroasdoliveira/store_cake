export interface CardDraft {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface CheckoutSummary {
  subtotal: number;
  delivery: number;
  discount: number;
  total: number;
}

export function maskZipCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function maskCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function maskExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

const paymentLabels: Record<string, string> = {
  PIX: "PIX",
  CARTAO: "Cartão de crédito",
  DINHEIRO: "Dinheiro na entrega",
};

export function paymentMethodLabel(method: string) {
  return paymentLabels[method] ?? method;
}

export function checkoutSummary(subtotal: number): CheckoutSummary {
  const delivery = 0;
  const discount = 0;
  return {
    subtotal: roundMoney(subtotal),
    delivery,
    discount,
    total: roundMoney(subtotal + delivery - discount),
  };
}

export function isLuhnValid(digits: string) {
  if (!/^\d{16}$/.test(digits)) {
    return false;
  }
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

export function isCardNameValid(name: string) {
  const normalized = name.trim();
  return normalized.length >= 3 && /^[A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+)*$/.test(normalized);
}

export function isExpiryValid(expiry: string, today = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }
  const lastMoment = new Date(year, month, 0, 23, 59, 59, 999);
  return lastMoment >= today;
}

export function isCardComplete(card: CardDraft, today = new Date()) {
  return (
    isLuhnValid(card.number.replace(/\D/g, "")) &&
    isCardNameValid(card.name) &&
    isExpiryValid(card.expiry, today) &&
    /^\d{3}$/.test(card.cvv)
  );
}
