import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { CreditCardPreview } from "../components/CreditCardPreview";
import { Feedback } from "../components/Feedback";
import { PixPayment } from "../components/PixPayment";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { DeliveryAddress, FeedbackMessage, Order, Promotion } from "../types";
import {
  addressFromOrder,
  createAddressId,
  emptyAddressBook,
  emptyAddressDraft,
  readAddressBook,
  sameAddress,
  uniqueAddresses,
  writeAddressBook,
  type AddressBook,
  type AddressDraft,
} from "../utils/addresses";
import { BRAZIL_STATES, isBrazilState } from "../utils/brazilStates";
import {
  checkoutSummary,
  isCardComplete,
  maskCardNumber,
  maskExpiry,
  maskZipCode,
  type CardDraft,
} from "../utils/checkout";
import { formatCurrency } from "../utils/money";

type PaymentMethod = "PIX" | "CARTAO" | "DINHEIRO";
type AddressStatus = "loading" | "ready" | "error";
type CardField = "number" | "name" | "expiry" | "cvv";

const emptyCard: CardDraft = { number: "", name: "", expiry: "", cvv: "" };

export function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [confirmation, setConfirmation] = useState<Order | null>(null);
  const [pixOrder, setPixOrder] = useState<Order | null>(null);
  const [pixAmount, setPixAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promotionId, setPromotionId] = useState("");
  const [card, setCard] = useState<CardDraft>(emptyCard);
  const [cardFocus, setCardFocus] = useState<CardField | null>(null);
  const [localBook, setLocalBook] = useState<AddressBook>(emptyAddressBook);
  const [orderAddresses, setOrderAddresses] = useState<DeliveryAddress[]>([]);
  const [addressStatus, setAddressStatus] = useState<AddressStatus>("loading");
  const [addingAddress, setAddingAddress] = useState(false);
  const [switchingAddress, setSwitchingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressDraft>(emptyAddressDraft);
  const [zipLoading, setZipLoading] = useState(false);
  const zipRequest = useRef(0);

  useEffect(() => {
    api.listPromotions().then(setPromotions).catch(() => setPromotions([]));
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }
    let active = true;
    setAddressStatus("loading");
    setLocalBook(readAddressBook(user.userId));
    api
      .listOrders(user.userId)
      .then((orders) => {
        if (!active) {
          return;
        }
        setOrderAddresses(uniqueAddresses(orders.map(addressFromOrder)));
        setAddressStatus("ready");
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }
        setAddressStatus("error");
        setFeedback({
          type: "error",
          text: error instanceof Error ? error.message : "Não foi possível carregar os endereços.",
        });
      });
    return () => {
      active = false;
    };
  }, [user]);

  const savedAddresses = useMemo(
    () => uniqueAddresses([...localBook.addresses, ...orderAddresses]),
    [localBook.addresses, orderAddresses]
  );
  const selectedAddress =
    savedAddresses.find((address) => address.id === localBook.selectedId) ?? savedAddresses[0] ?? null;
  const summary = checkoutSummary(total);
  const showAddressForm = addressStatus !== "loading" && (addingAddress || savedAddresses.length === 0);
  const cardReady = paymentMethod !== "CARTAO" || isCardComplete(card);

  const blockReason = !user
    ? ""
    : addressStatus === "loading"
      ? "Aguarde o carregamento dos endereços."
      : !selectedAddress
        ? "Salve um endereço de entrega para finalizar a compra."
        : !cardReady
          ? "Preencha os dados do cartão para finalizar a compra."
          : "";

  const persistBook = (book: AddressBook) => {
    if (!user) {
      return;
    }
    setLocalBook(book);
    writeAddressBook(user.userId, book);
  };

  const chooseAddress = (addressId: string) => {
    persistBook({ ...localBook, selectedId: addressId });
    setSwitchingAddress(false);
  };

  const searchZipCode = async (zipCode: string) => {
    const digits = zipCode.replace(/\D/g, "");
    if (digits.length !== 8) {
      zipRequest.current += 1;
      setZipLoading(false);
      return;
    }
    const requestId = ++zipRequest.current;
    setZipLoading(true);
    setFeedback((current) => (current?.type === "error" ? null : current));
    try {
      const result = await api.lookupZipCode(digits);
      if (requestId !== zipRequest.current) {
        return;
      }
      setAddressForm((current) => {
        if (current.zipCode.replace(/\D/g, "") !== digits) {
          return current;
        }
        return {
          ...current,
          street: result.street,
          neighborhood: result.neighborhood,
          city: result.city,
          state: isBrazilState(result.state) ? result.state : current.state,
        };
      });
    } catch (error) {
      if (requestId !== zipRequest.current) {
        return;
      }
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível consultar o CEP.",
      });
    } finally {
      if (requestId === zipRequest.current) {
        setZipLoading(false);
      }
    }
  };

  const saveAddress = (event: FormEvent) => {
    event.preventDefault();
    if (!user) {
      return;
    }
    const draft: AddressDraft = {
      street: addressForm.street.trim(),
      number: addressForm.number.trim(),
      complement: addressForm.complement.trim(),
      neighborhood: addressForm.neighborhood.trim(),
      city: addressForm.city.trim(),
      state: addressForm.state.trim().toUpperCase(),
      zipCode: maskZipCode(addressForm.zipCode),
    };
    if (
      !draft.street ||
      !draft.number ||
      !draft.neighborhood ||
      !draft.city ||
      !isBrazilState(draft.state) ||
      draft.zipCode.replace(/\D/g, "").length !== 8
    ) {
      setFeedback({ type: "error", text: "Preencha o endereço de entrega." });
      return;
    }

    const existing = savedAddresses.find((address) => sameAddress(address, draft));
    if (existing) {
      persistBook({ ...localBook, selectedId: existing.id });
      setAddingAddress(false);
      setAddressForm(emptyAddressDraft());
      setFeedback({ type: "success", text: "Esse endereço já está salvo." });
      return;
    }

    const address = { ...draft, id: createAddressId() };
    persistBook({
      addresses: [address, ...localBook.addresses],
      selectedId: address.id,
    });
    setAddingAddress(false);
    setAddressForm(emptyAddressDraft());
    setFeedback({ type: "success", text: "Endereço de entrega salvo." });
  };

  const finishOrder = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !selectedAddress || blockReason) {
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    try {
      const order = await api.createOrder({
        userId: user.userId,
        street: selectedAddress.street,
        number: selectedAddress.number,
        complement: selectedAddress.complement,
        neighborhood: selectedAddress.neighborhood,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zipCode,
        paymentMethod,
        ...(promotionId ? { promotionId: Number(promotionId) } : {}),
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
      });
      const amount = summary.total;
      clear();
      if (paymentMethod === "PIX") {
        setPixAmount(amount);
        setPixOrder(order);
        return;
      }
      setConfirmation(order);
      setFeedback({
        type: "success",
        text: `Pedido #${order.id} confirmado. Total: ${formatCurrency(order.total)}.`,
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text: error instanceof Error ? error.message : "Não foi possível finalizar a compra.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <section className="panel">
        <h1>Checkout</h1>
        <p>Faça login para finalizar o pedido.</p>
        <Link to="/login" className="button-link">
          Ir para login
        </Link>
      </section>
    );
  }

  if (items.length === 0 && !confirmation && !pixOrder) {
    return (
      <section className="panel">
        <h1>Checkout</h1>
        <p>Adicione cupcakes ao carrinho antes de finalizar.</p>
        <Link to="/" className="button-link">
          Ver vitrine
        </Link>
      </section>
    );
  }

  if (pixOrder) {
    return <PixPayment order={pixOrder} amount={pixAmount} onOpenHistory={() => navigate("/historico")} />;
  }

  if (confirmation) {
    return (
      <section className="panel narrow">
        <h1>Pedido confirmado</h1>
        <Feedback message={feedback} />
        <div className="receipt">
          <p>
            Número do pedido: <strong>#{confirmation.id}</strong>
          </p>
          <p>
            Valor total: <strong>{formatCurrency(confirmation.total)}</strong>
          </p>
          <p>Pagamento: {confirmation.paymentMethod}</p>
          <p>
            Entrega: {confirmation.street}, {confirmation.number} - {confirmation.city}/{confirmation.state}
          </p>
        </div>
        <div className="checkout-actions">
          <button type="button" onClick={() => navigate("/historico")}>
            Ver histórico
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="checkout-layout">
      <h1>Finalizar pedido</h1>
      <Feedback message={feedback} />

      <section className="panel checkout-section" aria-labelledby="delivery-address-title">
        <h2 id="delivery-address-title">Endereço de entrega</h2>
        {addressStatus === "loading" && <p>Carregando endereços...</p>}
        {selectedAddress && (
          <div className="address-summary">
            <p className="eyebrow">Endereço selecionado</p>
            <p>
              <strong>
                {selectedAddress.street}, {selectedAddress.number}
              </strong>
              {selectedAddress.complement ? ` — ${selectedAddress.complement}` : ""}
            </p>
            <p>
              {selectedAddress.neighborhood} — {selectedAddress.city}/{selectedAddress.state}
            </p>
            <p>CEP {selectedAddress.zipCode}</p>
            <div className="checkout-actions">
              <button
                type="button"
                onClick={() => {
                  setAddingAddress(true);
                  setSwitchingAddress(false);
                  setAddressForm(emptyAddressDraft());
                }}
              >
                Adicionar novo endereço
              </button>
              {savedAddresses.length > 1 && (
                <button type="button" className="ghost" onClick={() => setSwitchingAddress((current) => !current)}>
                  Trocar endereço
                </button>
              )}
            </div>
            {switchingAddress && (
              <fieldset className="address-picker">
                <legend>Escolha o endereço</legend>
                {savedAddresses.map((address) => (
                  <label key={address.id} className="address-option">
                    <input
                      type="radio"
                      name="delivery-address"
                      checked={address.id === selectedAddress.id}
                      onChange={() => chooseAddress(address.id)}
                    />
                    <span>
                      {address.street}, {address.number} — {address.city}/{address.state}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </div>
        )}
        {addingAddress && selectedAddress && (
          <p className="checkout-note">A entrega continua no endereço selecionado até você salvar o novo.</p>
        )}
        {showAddressForm && (
          <form onSubmit={saveAddress} className="form grid-form">
            <label className="span-2">
              CEP
              <input
                inputMode="numeric"
                autoComplete="postal-code"
                value={addressForm.zipCode}
                maxLength={9}
                onChange={(event) => {
                  const zipCode = maskZipCode(event.target.value);
                  setAddressForm((current) => ({ ...current, zipCode }));
                  void searchZipCode(zipCode);
                }}
                required
              />
            </label>
            {zipLoading && <p className="span-2 field-hint">Buscando CEP...</p>}
            <label className="span-2">
              Rua
              <input
                autoComplete="address-line1"
                value={addressForm.street}
                onChange={(event) => setAddressForm({ ...addressForm, street: event.target.value })}
                required
              />
            </label>
            <label>
              Número
              <input
                value={addressForm.number}
                onChange={(event) => setAddressForm({ ...addressForm, number: event.target.value })}
                required
              />
            </label>
            <label>
              Complemento
              <input
                autoComplete="address-line2"
                value={addressForm.complement}
                onChange={(event) => setAddressForm({ ...addressForm, complement: event.target.value })}
              />
            </label>
            <label>
              Bairro
              <input
                value={addressForm.neighborhood}
                onChange={(event) => setAddressForm({ ...addressForm, neighborhood: event.target.value })}
                required
              />
            </label>
            <label>
              Cidade
              <input
                autoComplete="address-level2"
                value={addressForm.city}
                onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })}
                required
              />
            </label>
            <label className="span-2">
              UF
              <select
                autoComplete="address-level1"
                value={addressForm.state}
                onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })}
                required
              >
                <option value="">Selecione</option>
                {BRAZIL_STATES.map((state) => (
                  <option key={state.uf} value={state.uf}>
                    {state.uf} — {state.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="checkout-actions span-2">
              <button type="submit">Salvar endereço</button>
              {selectedAddress && (
                <button
                  type="button"
                  className="ghost"
                  onClick={() => {
                    zipRequest.current += 1;
                    setZipLoading(false);
                    setAddingAddress(false);
                    setAddressForm(emptyAddressDraft());
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </section>

      <section className="panel checkout-section" aria-labelledby="payment-title">
        <h2 id="payment-title">Pagamento</h2>
        <dl className="checkout-totals">
          <div>
            <dt>Total</dt>
            <dd>{formatCurrency(summary.subtotal)}</dd>
          </div>
          <div>
            <dt>Entrega</dt>
            <dd>{summary.delivery === 0 ? "Grátis" : formatCurrency(summary.delivery)}</dd>
          </div>
          {summary.discount > 0 && (
            <div>
              <dt>Desconto</dt>
              <dd>- {formatCurrency(summary.discount)}</dd>
            </div>
          )}
          <div className="checkout-grand-total">
            <dt>Total da compra</dt>
            <dd>{formatCurrency(summary.total)}</dd>
          </div>
        </dl>
        <form onSubmit={finishOrder} className="form">
          {promotions.length > 0 && (
            <label>
              Promoção
              <select value={promotionId} onChange={(event) => setPromotionId(event.target.value)}>
                <option value="">Nenhuma</option>
                {promotions.map((promotion) => (
                  <option key={promotion.id} value={promotion.id}>
                    {promotion.title} ({promotion.discountPercent}%)
                  </option>
                ))}
              </select>
            </label>
          )}
          <label>
            Pagamento
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}
            >
              <option value="PIX">PIX</option>
              <option value="CARTAO">Cartão de crédito</option>
              <option value="DINHEIRO">Dinheiro na entrega</option>
            </select>
          </label>
          {paymentMethod === "PIX" && (
            <p className="checkout-note">O QR Code será gerado na próxima tela e vale por 15 minutos.</p>
          )}
          {paymentMethod === "DINHEIRO" && (
            <p className="checkout-note">O pagamento será feito em dinheiro na entrega.</p>
          )}
          {paymentMethod === "CARTAO" && (
            <div className="payment-card-layout">
              <CreditCardPreview
                number={card.number}
                name={card.name}
                expiry={card.expiry}
                cvv={card.cvv}
                flipped={cardFocus === "cvv"}
              />
              <div className="form">
                <label>
                  Número do cartão
                  <input
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={card.number}
                    onChange={(event) => setCard({ ...card, number: maskCardNumber(event.target.value) })}
                    onFocus={() => setCardFocus("number")}
                    onBlur={() => setCardFocus((current) => (current === "number" ? null : current))}
                  />
                </label>
                <label>
                  Nome impresso no cartão
                  <input
                    autoComplete="cc-name"
                    value={card.name}
                    onChange={(event) => setCard({ ...card, name: event.target.value })}
                    onFocus={() => setCardFocus("name")}
                    onBlur={() => setCardFocus((current) => (current === "name" ? null : current))}
                  />
                </label>
                <label>
                  Validade
                  <input
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/AA"
                    value={card.expiry}
                    onChange={(event) => setCard({ ...card, expiry: maskExpiry(event.target.value) })}
                    onFocus={() => setCardFocus("expiry")}
                    onBlur={() => setCardFocus((current) => (current === "expiry" ? null : current))}
                  />
                </label>
                <label>
                  CVV
                  <input
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    value={card.cvv}
                    maxLength={3}
                    onChange={(event) =>
                      setCard({ ...card, cvv: event.target.value.replace(/\D/g, "").slice(0, 3) })
                    }
                    onFocus={() => setCardFocus("cvv")}
                    onBlur={() => setCardFocus((current) => (current === "cvv" ? null : current))}
                  />
                </label>
              </div>
            </div>
          )}
          {blockReason && <p className="checkout-note">{blockReason}</p>}
          <div className="checkout-actions">
            <button type="submit" disabled={Boolean(blockReason) || submitting}>
              {submitting ? "Finalizando..." : "Finalizar compra"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
