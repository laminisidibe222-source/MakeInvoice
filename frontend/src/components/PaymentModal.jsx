import { useState } from 'react';
import { CreditCard, Loader2, Shield, Check, X } from 'lucide-react';
import { apiFetch } from '../Supabase';
import {
  WaveLogo,
  OrangeMoneyLogo,
  MixxByYasLogo,
  CardLogo,
} from './BrandLogos';

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 4500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 7500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 12000, limit: 100 },
};


const METHODS = [
  {
    key: 'wave',
    label: 'Wave',
    desc: 'Sans frais',
    Logo: WaveLogo,
    color: '#1DC8FF',
    requiresPhone: true,
  },
  {
    key: 'orange',
    label: 'Orange Money',
    desc: 'Rapide & sécurisé',
    Logo: OrangeMoneyLogo,
    color: '#FF7900',
    requiresPhone: true,
  },
  {
    key: 'mixx',
    label: 'Mixx by Yas',
    desc: 'Ex-Free Money',
    Logo: MixxByYasLogo,
    color: '#0066FF',
    requiresPhone: true,
  },
  {
    key: 'card',
    label: 'Carte bancaire',
    desc: 'Visa · Mastercard',
    Logo: CardLogo,
    color: '#6366F1',
    requiresPhone: false,
  },
]

export default function PaymentModal({ plan, onClose, onSuccess, showToast }) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('wave');
  const [phone, setPhone] = useState('');
  const planData = PLANS[plan];
  const activeMethod = METHODS.find(m => m.key === method);

  const phoneValid =
    !activeMethod.requiresPhone ||
    /^(?:\+?221)?[ ]?7[05678][ ]?\d{3}[ ]?\d{2}[ ]?\d{2}$/.test(phone.replace(/\s/g, ''));

  const handlePay = async () => {
    if (!phoneValid) {
      showToast('Entrez un numéro sénégalais valide (ex: 77 123 45 67)', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch('/api/pay', {
        method: 'POST',
        body: JSON.stringify({ plan, method, phone }),
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      showToast(err.message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal payment-modal slide-up" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <button className="modal-close" onClick={onClose} disabled={loading} aria-label="Fermer">
          <X size={18} />
        </button>

        <div className="pm-header">
          <div className="pm-plan-badge">Plan {planData.name}</div>
          <h3 className="pm-title">Finaliser le paiement</h3>
          <p className="pm-subtitle">
            Abonnement mensuel · {planData.limit} factures
          </p>
        </div>

        {/* Price summary */}
        <div className="pm-summary">
          <div className="pm-summary-row">
            <span className="pm-summary-label">Total à payer</span>
            <span className="pm-summary-price">
              {planData.priceFCFA.toLocaleString('fr-SN')}
              <small>FCFA</small>
            </span>
          </div>
          <div className="pm-summary-note">
            <Shield size={13} /> Paiement sécurisé · Annulable à tout moment
          </div>
        </div>

        {/* Payment method grid */}
        <div className="pm-section-label">Moyen de paiement</div>
        <div className="pm-methods">
          {METHODS.map(({ key, label, desc, Logo, color }) => {
            const isActive = method === key;
            return (
              <button
                key={key}
                type="button"
                className={`pm-method ${isActive ? 'active' : ''}`}
                onClick={() => setMethod(key)}
                disabled={loading}
                style={isActive ? { '--brand-color': color } : {}}
              >
                <div className="pm-method-logo">
                  <Logo size={32} />
                </div>
                <div className="pm-method-info">
                  <span className="pm-method-label">{label}</span>
                  <span className="pm-method-desc">{desc}</span>
                </div>
                <div className="pm-method-check">
                  {isActive && <Check size={12} strokeWidth={3.5} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Phone input (mobile money only) */}
        {activeMethod.requiresPhone && (
          <div className="pm-phone-block">
            <label className="pm-phone-label">
              Numéro {activeMethod.label}
            </label>
            <div className="pm-phone-input">
              <span className="pm-phone-prefix">🇸🇳 +221</span>
              <input
                type="tel"
                inputMode="numeric"
                placeholder="77 123 45 67"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="pm-phone-hint">
              Vous recevrez une notification sur {activeMethod.label} pour valider.
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          className="btn pm-pay-btn"
          onClick={handlePay}
          disabled={loading || !phoneValid}
          style={{ '--brand-color': activeMethod.color }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              Redirection vers {activeMethod.label}...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              Payer {planData.priceFCFA.toLocaleString('fr-SN')} FCFA
            </>
          )}
        </button>

        <button className="pm-cancel" onClick={onClose} disabled={loading}>
          Annuler
        </button>

        <p className="pm-legal">
          En continuant, vous acceptez nos conditions générales de vente.
        </p>
      </div>
    </div>
  );
}