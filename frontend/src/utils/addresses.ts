import type { DeliveryAddress, Order } from "../types";

export type AddressDraft = Omit<DeliveryAddress, "id">;

export interface AddressBook {
  selectedId: string | null;
  addresses: DeliveryAddress[];
}

const storageKey = (userId: number) => `cupcake-addresses:${userId}`;

export function emptyAddressDraft(): AddressDraft {
  return {
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
  };
}

export function emptyAddressBook(): AddressBook {
  return { selectedId: null, addresses: [] };
}

export function createAddressId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `endereco-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function sameAddress(left: AddressDraft, right: AddressDraft) {
  return (
    left.street.trim().toLowerCase() === right.street.trim().toLowerCase() &&
    left.number.trim().toLowerCase() === right.number.trim().toLowerCase() &&
    left.complement.trim().toLowerCase() === right.complement.trim().toLowerCase() &&
    left.zipCode.replace(/\D/g, "") === right.zipCode.replace(/\D/g, "")
  );
}

export function addressFromOrder(order: Order): DeliveryAddress {
  return {
    id: `order-${order.id}`,
    street: order.street,
    number: order.number,
    complement: order.complement ?? "",
    neighborhood: order.neighborhood,
    city: order.city,
    state: order.state,
    zipCode: order.zipCode,
  };
}

export function uniqueAddresses(addresses: DeliveryAddress[]) {
  const unique: DeliveryAddress[] = [];
  for (const address of addresses) {
    if (!unique.some((item) => sameAddress(item, address))) {
      unique.push(address);
    }
  }
  return unique;
}

function isDeliveryAddress(value: unknown): value is DeliveryAddress {
  if (!value || typeof value !== "object") {
    return false;
  }
  const address = value as DeliveryAddress;
  return (
    typeof address.id === "string" &&
    typeof address.street === "string" &&
    typeof address.number === "string" &&
    typeof address.complement === "string" &&
    typeof address.neighborhood === "string" &&
    typeof address.city === "string" &&
    typeof address.state === "string" &&
    typeof address.zipCode === "string"
  );
}

export function readAddressBook(userId: number): AddressBook {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) {
      return emptyAddressBook();
    }
    const parsed = JSON.parse(raw) as Partial<AddressBook>;
    return {
      selectedId: typeof parsed.selectedId === "string" ? parsed.selectedId : null,
      addresses: Array.isArray(parsed.addresses) ? parsed.addresses.filter(isDeliveryAddress) : [],
    };
  } catch {
    return emptyAddressBook();
  }
}

export function writeAddressBook(userId: number, book: AddressBook) {
  localStorage.setItem(storageKey(userId), JSON.stringify(book));
}
