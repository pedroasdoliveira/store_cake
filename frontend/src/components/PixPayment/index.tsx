import { useEffect, useMemo, useState } from "react";
import { toString as renderQrSvg } from "qrcode";
import type { Order } from "../../types";
import { formatCurrency } from "../../utils/money";
import { PIX_TIMEOUT_SECONDS, buildPixPayload, formatClock } from "../../utils/pix";

interface PixPaymentProps {
  order: Order;
  amount: number;
  onOpenHistory: () => void;
}

export function PixPayment({ order, amount, onOpenHistory }: PixPaymentProps) {
  const [codeId, setCodeId] = useState(0);
  const [remaining, setRemaining] = useState(PIX_TIMEOUT_SECONDS);
  const [qrSvg, setQrSvg] = useState("");
  const [qrError, setQrError] = useState("");
  const [copied, setCopied] = useState(false);

  const payload = useMemo(
    () =>
      buildPixPayload({
        amount,
        city: order.city,
        txid: `PED${order.id}T${codeId}`,
      }),
    [amount, codeId, order.city, order.id]
  );

  useEffect(() => {
    const deadline = Date.now() + PIX_TIMEOUT_SECONDS * 1000;
    const update = () => {
      setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [codeId]);

  useEffect(() => {
    let active = true;
    setQrSvg("");
    setQrError("");
    setCopied(false);
    renderQrSvg(payload, {
      type: "svg",
      margin: 1,
      width: 240,
      color: { dark: "#3b2a24", light: "#ffffff" },
    })
      .then((svg) => {
        if (active) {
          setQrSvg(svg);
        }
      })
      .catch(() => {
        if (active) {
          setQrError("Não foi possível gerar o QR Code.");
        }
      });
    return () => {
      active = false;
    };
  }, [payload]);

  const expired = remaining === 0;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
    } catch {
      setCopied(false);
      setQrError("Não foi possível copiar. Selecione o código abaixo.");
    }
  };

  return (
    <section className="panel narrow checkout-layout pix-panel">
      <h1>Pague com PIX</h1>
      <p>
        Pedido <strong>#{order.id}</strong> registrado. Escaneie o QR Code ou copie o código. O prazo é de 15 minutos.
      </p>
      <p className="pix-amount">
        Valor a pagar: <strong>{formatCurrency(amount)}</strong>
      </p>
      <p className="pix-timer" role="timer">
        {expired ? "O tempo para pagamento deste código expirou." : `O código expira em ${formatClock(remaining)}`}
      </p>
      {qrError && <p className="feedback error">{qrError}</p>}
      {qrSvg ? (
        <div
          className={expired ? "pix-qr is-expired" : "pix-qr"}
          role="img"
          aria-label="QR Code para pagamento PIX"
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      ) : (
        !qrError && <p className="checkout-note">Gerando QR Code...</p>
      )}
      <label>
        Copia e cola
        <textarea className="pix-code" readOnly value={payload} rows={4} />
      </label>
      <div className="checkout-actions">
        <button type="button" onClick={copyCode} disabled={expired}>
          {copied ? "Código copiado" : "Copiar código PIX"}
        </button>
        {expired && (
          <button type="button" onClick={() => setCodeId((current) => current + 1)}>
            Gerar novo código
          </button>
        )}
        <button type="button" className="ghost" onClick={onOpenHistory}>
          Ver histórico
        </button>
      </div>
    </section>
  );
}
