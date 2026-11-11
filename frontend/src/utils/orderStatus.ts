const labels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PREPARING: "Em preparo",
  OUT_FOR_DELIVERY: "Saiu para entrega",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
};

const customerLabels: Record<string, string> = {
  ...labels,
  CONFIRMED: "Pedido recebido",
};

export const orderStatuses = Object.entries(labels);

export function orderStatusLabel(status: string) {
  return labels[status] ?? status;
}

export function customerOrderStatusLabel(status: string) {
  return customerLabels[status] ?? status;
}

export function trackingMessage(order: { id: number; status: string }) {
  if (order.status === "CONFIRMED") {
    return `Seu pedido #${order.id} foi recebido.`;
  }
  if (order.status === "PREPARING") {
    return `Seu pedido #${order.id} está em preparo.`;
  }
  if (order.status === "OUT_FOR_DELIVERY") {
    return `Seu pedido #${order.id} saiu para entrega.`;
  }
  return null;
}
