import { detectCardBrand, CardBrand } from './card-brand';
import './card-preview.css';

type CardPreviewProps = {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  flipped: boolean;
};

function groupDigits(digits: string): string[] {
  const padded = digits.padEnd(16, '•').slice(0, 16);
  const groups: string[] = [];
  for (let i = 0; i < 16; i += 4) groups.push(padded.slice(i, i + 4));
  return groups;
}

export function CardPreview({ cardNumber, cardHolder, expiryMonth, expiryYear, cvv, flipped }: CardPreviewProps) {
  const digits = cardNumber.replace(/\D/g, '');
  const brand = detectCardBrand(digits);
  const name = cardHolder.trim() || 'NOME DO TITULAR';
  const mm = expiryMonth.trim() ? expiryMonth.padStart(2, '0').slice(0, 2) : 'MM';
  const yy = expiryYear.trim() ? expiryYear.slice(-2).padStart(2, '0') : 'AA';

  return (
    <div className={`card-preview${flipped ? ' card-preview--flipped' : ''}`} aria-hidden="true">
      <div className="card-preview__inner">
        <div className="card-preview__face card-preview__face--front">
          <div className="card-preview__top">
            <div className="card-preview__chip" />
            <span className="card-preview__stamp">simulado</span>
          </div>

          <div className="card-preview__number mono">
            {groupDigits(digits).map((group, i) => (
              <span key={i}>{group}</span>
            ))}
          </div>

          <div className="card-preview__bottom">
            <div className="card-preview__id">
              <span className="card-preview__label">Titular</span>
              <span className="card-preview__value">{name.toUpperCase()}</span>
            </div>
            <div className="card-preview__id card-preview__id--expiry">
              <span className="card-preview__label">Validade</span>
              <span className="card-preview__value mono">
                {mm}/{yy}
              </span>
            </div>
            <BrandMark brand={brand} />
          </div>
        </div>

        <div className="card-preview__face card-preview__face--back">
          <div className="card-preview__magstripe" />
          <div className="card-preview__signature">
            <span className="card-preview__cvv mono">{(cvv || '').padEnd(3, '•').slice(0, 3)}</span>
          </div>
          <div className="card-preview__back-footer">
            <BrandMark brand={brand} muted />
          </div>
        </div>
      </div>
    </div>
  );
}

function BrandMark({ brand, muted }: { brand: CardBrand | null; muted?: boolean }) {
  const cls = `card-preview__brand${muted ? ' card-preview__brand--muted' : ''}`;
  if (brand === 'VISA') return <span className={`${cls} card-preview__brand--visa`}>VISA</span>;
  if (brand === 'MASTERCARD')
    return (
      <span className={`${cls} card-preview__brand--mc`}>
        <i />
        <i />
      </span>
    );
  if (brand === 'ELO') return <span className={`${cls} card-preview__brand--elo`}>elo</span>;
  return <span className={`${cls} card-preview__brand--unknown`}>••••</span>;
}
