import { useState } from 'react';
import { Loader2, ShieldCheck, X, Check, Copy, Smartphone } from 'lucide-react';
import { apiFetch } from '../supabase';
import waveLogo from '../assets/logos/wave-log.png'; // 👈 On importe ton image

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 2500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 6500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 10000, limit: 100 },
};

// 🎯 REMPLACE PAR TON VRAI NUMÉRO WAVE
const WAVE_NUMBER = '+221 77 724 81 84'; 

export default function PaymentModal({ plan, onClose }) {
  const [phone, setPhone] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const planData = PLANS[plan];

  const copyNumber = () => {
    navigator.clipboard.writeText(WAVE_NUMBER.replace(/\s/g, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!phone) return setError('Veuillez entrer votre numéro Wave');
    
    // Validation basique du numéro (ex: 77 123 45 67)
    if (phone.replace(/\s/g, '').length < 9) {
      return setError('Numéro de téléphone invalide');
    }

    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          plan,
          method: 'wave',
          senderPhone: phone,
          transactionId: transactionId || null,
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal payment-modal slide-up" style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div className="pm-success-check">
            <Check size={40} strokeWidth={3} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>Demande envoyée !</h3>
          <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
            Votre compte sera activé sous 24h après vérification du paiement. Vous recevrez une confirmation par email.
          </p>
          <button className="btn btn-generate" onClick={onClose} style={{ width: '100%', justifyContent: 'center' }}>
            Retour à l'application
          </button>
        </div>
      </div>
    );
  }

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
          
          {/* Carte de paiement unifiée */}
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
                <img src={waveLogo} alt="Wave" className="pm-wave-logo" />
                <span>Paiement via Wave</span>
              </div>
              
              <div className="pm-number-box" onClick={copyNumber}>
                <div className="pm-number-left">
                  <Smartphone size={18} className="pm-number-icon" />
                  <strong>{WAVE_NUMBER}</strong>
                </div>
                <button type="button" className="pm-copy-btn" aria-label="Copier">
                  {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="pm-hint-text">
                Copiez ce numéro et envoyez exactement le montant indiqué.
              </p>
            </div>
          </div>

          {/* Formulaire de confirmation */}
          <div className="pm-form-section">
            <label className="pm-field">
              <span>Votre numéro Wave (expéditeur)</span>
              <input
                type="tel"
                placeholder="Ex: 77 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </label>
            
            <label className="pm-field">
              <span>ID de transaction <span className="pm-optional">(Optionnel)</span></span>
              <input
                type="text"
                placeholder="Ex: TXN987654321"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </label>
          </div>

          {error && <div className="pm-error-box">{error}</div>}

          <div className="pm-security-note">
            <ShieldCheck size={16} />
            <span>Activation manuelle sous 24h après vérification.</span>
          </div>
        </div>

        <div className="pm-footer" style={{ padding: '24px 32px' }}>
          <button
            className="btn btn-wave"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><Loader2 size={18} className="spin" /> Vérification...</>
            ) : (
              <><Check size={18} /> J'ai effectué le paiement</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}