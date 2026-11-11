interface CreditCardPreviewProps {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  flipped: boolean;
}

function cardDigits(number: string) {
  return number.replace(/\D/g, "").slice(0, 16);
}

export function CreditCardPreview({ number, name, expiry, cvv, flipped }: CreditCardPreviewProps) {
  const digits = cardDigits(number);
  const groups = [0, 1, 2, 3].map((group) => digits.padEnd(16, "•").slice(group * 4, group * 4 + 4));
  const holder = name.trim() ? name.toUpperCase() : "NOME NO CARTÃO";
  const cvvDigits = cvv.padEnd(3, "•").slice(0, 3);

  return (
    <div className="credit-card-scene" aria-hidden="true">
      <div className={`credit-card-inner${flipped ? " is-flipped" : ""}`}>
        <div className="credit-card-face credit-card-front">
          <div className="credit-card-brand">
            <span className="credit-card-chip" />
            <strong>Cupcakes</strong>
          </div>
          <p className="credit-card-number" aria-hidden="true">
            {groups.map((group, groupIndex) => (
              <span key={groupIndex} className="credit-card-group">
                {group.split("").map((character, index) => {
                  const position = groupIndex * 4 + index;
                  const filled = position < digits.length;
                  return (
                    <span
                      key={`${position}-${character}`}
                      className={filled ? "credit-card-digit is-filled" : "credit-card-digit"}
                    >
                      {character}
                    </span>
                  );
                })}
              </span>
            ))}
          </p>
          <div className="credit-card-footer">
            <p className={name.trim() ? "" : "is-placeholder"}>{holder}</p>
            <p className={expiry ? "" : "is-placeholder"}>{expiry || "MM/AA"}</p>
          </div>
        </div>
        <div className="credit-card-face credit-card-back">
          <div className="credit-card-stripe" />
          <div className="credit-card-cvv-row">
            <span>CVV</span>
            <strong aria-hidden="true">
              {cvvDigits.split("").map((character, index) => (
                <span key={`${index}-${character}`} className={index < cvv.length ? "credit-card-digit is-filled" : "credit-card-digit"}>
                  {character}
                </span>
              ))}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
