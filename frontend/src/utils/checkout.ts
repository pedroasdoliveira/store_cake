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

export function cardLastDigits(number: string) {
  return number.replace(/\D/g, "").slice(-4);
}

export function cardBrand(number: string) {
  const digits = number.replace(/\D/g, "");
  if (/^(4011|431274|438935|451416|457393|504175|5067|509|627780|636297|636368|650|6516|6550)/.test(digits)) {
    return "Elo";
  }
  if (digits.startsWith("4")) {
    return "Visa";
  }
  if (/^(5[1-5]|2[2-7])/.test(digits)) {
    return "Mastercard";
  }
  if (/^3[47]/.test(digits)) {
    return "American Express";
  }
  return "Elo";
}

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
