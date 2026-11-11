import { describe, expect, it } from "vitest";
import { confirmedOrder } from "../test/fixtures";
import { addressFromOrder, readAddressBook, sameAddress, uniqueAddresses, writeAddressBook } from "./addresses";

describe("endereços", () => {
  it("guarda e recupera os endereços da conta no navegador", () => {
    const address = { ...addressFromOrder(confirmedOrder), id: "local-1" };
    writeAddressBook(7, { selectedId: "local-1", addresses: [address] });

    expect(readAddressBook(7)).toEqual({ selectedId: "local-1", addresses: [address] });
  });

  it("deduplica o endereço que já veio de um pedido", () => {
    const fromOrder = addressFromOrder(confirmedOrder);
    const repeated = { ...fromOrder, id: "outro" };
    expect(sameAddress(fromOrder, repeated)).toBe(true);
    expect(uniqueAddresses([fromOrder, repeated])).toEqual([fromOrder]);
  });
});
