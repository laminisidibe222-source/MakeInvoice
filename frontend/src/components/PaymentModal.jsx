import { useState } from 'react';
import { Loader2, Shield, X, ArrowRight, Check } from 'lucide-react';
import { apiFetch } from '../supabase';
import { useLang } from '../i18n/LanguageContext';

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 4500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 7500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 12000, limit: 100 },
};

const FEATURES = {
  starter:  ['10 factures / mois', 'Export PDF', 'TVA & remises', 'Support email'],
  pro:      ['30 factures / mois', 'Tous les modèles', 'Export PDF & CSV', 'Support prioritaire'],
  business: ['100 factures / mois', 'API & intégrations', 'Support dédié', 'Multi-utilisateurs'],
};

export default function PaymentModal({ plan, onClose, onSuccess, showToast }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const planData = PLANS[plan];

  const handlePay = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan }),
      });

      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Pas d\'URL de checkout');
      }
    } catch (err) {
      showToast(err.message || 'Erreur de paiement', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal payment-modal slide-up" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="pm-header">
          <div className="pm-plan-badge">
            {t('payment.plan')} {planData.name}
          </div>
          <h3 className="pm-title">Finaliser le paiement</h3>
          <p className="pm-subtitle">
            Abonnement mensuel · {planData.limit} factures
          </p>
        </div>

        <div className="pm-scroll">
          <div className="pm-summary">
            <div className="pm-summary-row">
              <span className="pm-summary-label">Total à payer</span>
              <span className="pm-summary-price">
                {planData.priceFCFA.toLocaleString('fr-SN')}
                <small>FCFA</small>
              </span>
            </div>
            <div className="pm-summary-note">
              <Shield size={13} /> Paiement sécurisé par Lemon Squeezy
            </div>
          </div>

          <div className="pm-section-label">Inclus dans votre plan</div>
          <ul className="pm-features-list">
            {FEATURES[plan].map((f, i) => (
              <li key={i}>
                <span className="pm-feature-check">
                  <Check size={12} strokeWidth={3.5} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="pm-payment-info">
            <p className="pm-info-text">
              Vous allez être redirigé vers la page de paiement sécurisée.
            </p>
            <p className="pm-info-methods">
              💳 Carte bancaire · 🌊 Wave · 🟠 Orange Money · 🔵 Mixx by Yas
            </p>
          </div>
        </div>

        <button
          className="btn pm-pay-btn"
          onClick={handlePay}
          disabled={loading}
          style={{ '--brand-color': '#6366F1' }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              Redirection...
            </>
          ) : (
            <>
              Payer {planData.priceFCFA.toLocaleString('fr-SN')} FCFA
              <ArrowRight size={16} />
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