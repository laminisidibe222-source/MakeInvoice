import { useState } from 'react';
import { Loader2, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { apiFetch } from '../lib/api.js';

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 4500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 7500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 12000, limit: 100 },
};

export default function PaymentModal({ plan, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const planData = PLANS[plan];
  if (!planData) return null;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      const { data, error: err } = await apiFetch('/api/pay', {
        method: 'POST',
        body: { plan },
      });
      if (err) throw new Error(err.message);
      const checkoutUrl = data?.checkout_url;
      if (!checkoutUrl) throw new Error("Saspay n'a pas retourné de lien de paiement.");
      // Redirect to the hosted Saspay checkout. Webhook upgrades the plan
      // automatically; /payment/success confirms with the server as fallback.
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => !loading && onClose()}>
      <div className="modal payment-modal slide-up" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={loading}>
          <X size={18} />
        </button>

        <div className="pm-header">
          <div className="pm-plan-badge">Abonnement {planData.name}</div>
          <h3 className="pm-title">Finaliser le paiement</h3>
          <p className="pm-subtitle">
            {planData.limit} factures par mois
          </p>
        </div>

        <div className="pm-scroll" style={{ padding: '0 32px' }}>
          <div className="pm-card">
            <div className="pm-card-top">
              <span className="pm-card-label">Total à payer</span>
              <div className="pm-card-amount">
                {planData.priceFCFA.toLocaleString('fr-SN')} <span>FCFA</span>
              </div>
            </div>

            <div className="pm-card-divider" />

            <div className="pm-card-bottom">
              <div className="pm-wave-brand">
                <ShieldCheck size={20} />
                <span>Paiement sécurisé via Saspay</span>
              </div>
              <p className="pm-hint-text">
                Vous serez redirigé vers la page de paiement Saspay
                (Wave, Orange Money, carte bancaire). Une fois le paiement
                confirmé, votre plan est activé automatiquement.
              </p>
            </div>
          </div>

          {error && <div className="pm-error-box">{error}</div>}

          <div className="pm-security-note">
            <ShieldCheck size={16} />
            <span>Activation automatique après confirmation du paiement.</span>
          </div>
        </div>

        <div className="pm-footer" style={{ padding: '24px 32px' }}>
          <button
            className="btn btn-wave"
            onClick={handlePay}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Redirection...</>
            ) : (
              <><ExternalLink size={18} /> Payer avec Saspay</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
