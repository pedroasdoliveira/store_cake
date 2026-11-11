export const PIX_TIMEOUT_SECONDS = 15 * 60;
export const PIX_KEY = "pedidos@cupcakes.com";

export function formatClock(totalSeconds: number) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function crc16Ccitt(value: string) {
  let crc = 0xffff;
  for (let index = 0; index < value.length; index += 1) {
    crc ^= value.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function field(id: string, value: string) {
  return `${id}${value.length.toString().padStart(2, "0")}${value}`;
}

function pixLabel(value: string, max: number, fallback: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, max);
  return normalized || fallback;
}

export function buildPixPayload(input: { amount: number; city: string; txid: string; merchantName?: string }) {
  const account = field("00", "br.gov.bcb.pix") + field("01", PIX_KEY);
  const txid = input.txid.replace(/[^A-Za-z0-9]/g, "").slice(0, 25) || "PEDIDO";
  const withoutCrc =
    field("00", "01") +
    field("26", account) +
    field("52", "0000") +
    field("53", "986") +
    field("54", input.amount.toFixed(2)) +
    field("58", "BR") +
    field("59", pixLabel(input.merchantName ?? "Loja de Cupcakes", 25, "LOJA DE CUPCAKES")) +
    field("60", pixLabel(input.city, 15, "SAO PAULO")) +
    field("62", field("05", txid)) +
    "6304";
  return withoutCrc + crc16Ccitt(withoutCrc);
}
