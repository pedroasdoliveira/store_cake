const labels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

export const orderStatuses = Object.entries(labels);

export function orderStatusLabel(status: string) {
  return labels[status] ?? status;
}
