import { useEffect, useMemo, useState } from "react";
import { toString as renderQrSvg } from "qrcode";
import type { Order } from "../../types";
import { paymentMethodLabel } from "../../utils/checkout";
import { buildPixPayload } from "../../utils/pix";

function PixProof({ order }: { order: Order }) {
  const [qrSvg, setQrSvg] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const payload = useMemo(
    () =>
      buildPixPayload({
        amount: order.total,
        city: order.city,
        txid: order.transactionCode ?? `PED${order.id}`,
      }),
    [order.city, order.id, order.total, order.transactionCode]
  );

  useEffect(() => {
    let active = true;
    renderQrSvg(payload, {
      type: "svg",
      margin: 1,
      width: 180,
      color: { dark: "#3b2a24", light: "#ffffff" },
    })
      .then((svg) => {
        if (active) {
          setQrSvg(svg);
        }
      })
      .catch(() => {
        if (active) {
          setCopyError("Não foi possível gerar o QR Code.");
        }
      });
    return () => {
      active = false;
    };
  }, [payload]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setCopyError("");
    } catch {
      setCopied(false);
      setCopyError("Não foi possível copiar. Selecione o código abaixo.");
    }
  };

  return (
    <div className="payment-proof">
      <p>
        <strong>PIX</strong>
      </p>
      {qrSvg ? (
        <div className="pix-qr" role="img" aria-label="QR Code para pagamento PIX" dangerouslySetInnerHTML={{ __html: qrSvg }} />
      ) : (
        !copyError && <p>Gerando QR Code...</p>
      )}
      <p className="pix-copy-code">{payload}</p>
      <button type="button" onClick={() => void copyCode()}>
        {copied ? "Código copiado" : "Copiar código"}
      </button>
      {copyError && <p>{copyError}</p>}
    </div>
  );
}

export function PaymentProof({ order }: { order: Order }) {
  const declined = order.paymentStatus === "RECUSADO";
  const pix = order.paymentMethod === "PIX" && Boolean(order.transactionCode);
  const card = order.paymentMethod === "CARTAO" && Boolean(order.cardLast4);
  const cash = order.paymentMethod === "DINHEIRO";

  return (
    <div className="payment-details">
      {pix && <PixProof order={order} />}
      {card && (
        <div className="payment-proof">
          <p>
            {order.cardBrand} •••• {order.cardLast4}
          </p>
          <p className={declined ? "payment-status is-declined" : "payment-status is-approved"}>
            {declined ? "Recusado" : "Aprovado"}
          </p>
        </div>
      )}
      {cash && (
        <div className="payment-proof">
          <p>O pagamento será feito em dinheiro na entrega.</p>
        </div>
      )}
      {!pix && !card && !cash && <p>Pagamento: {paymentMethodLabel(order.paymentMethod)}</p>}
      {order.transactionCode && <p>Código da transação: {order.transactionCode}</p>}
    </div>
  );
}
