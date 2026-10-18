import { useState } from 'react';
import { Loader2, Shield, X, Check, Smartphone, Copy } from 'lucide-react';
import { apiFetch } from '../supabase';
import WaveLogo from './Wavelogo';

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 2500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 6500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 10000, limit: 100 },
};

// 🎯 REMPLACE CE NUMÉRO PAR TON VRAI NUMÉRO WAVE
const WAVE_NUMBER = '+221 77 724 81 84';

export default function PaymentModal({ plan, onClose }) {
  const [step, setStep] = useState('send'); // On passe directement à l'étape d'envoi puisqu'il n'y a que Wave
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
    if (!phone) return setError('Entrez votre numéro Wave');
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/payments/manual', {
        method: 'POST',
        body: JSON.stringify({
          plan,
          method: 'wave', // Fixé sur wave
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
        <div className="modal payment-modal slide-up" style={{ padding: '40px' }}>
          <div className="pm-success" style={{ textAlign: 'center' }}>
            <div className="checkmark" style={{ margin: '0 auto 20px' }}><Check size={36} strokeWidth={3} /></div>
            <h3>Demande envoyée !</h3>
            <p style={{ color: '#64748B', margin: '10px 0 24px' }}>
              Votre compte sera activé sous 24h après vérification du paiement.
            </p>
            <button className="btn btn-generate" onClick={onClose} style={{ width: '100%' }}>
              Fermer
            </button>
          </div>
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
          <div className="pm-plan-badge">Plan {planData.name}</div>
          <h3 className="pm-title">Paiement par Wave</h3>
          <p className="pm-subtitle">
            {planData.priceFCFA.toLocaleString('fr-SN')} FCFA · {planData.limit} factures/mois
          </p>
        </div>

        <div className="pm-scroll">
          <div style={{ background: '#F8F9FD', padding: '20px', borderRadius: '14px', textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
              <WaveLogo size={48} />
            </div>
            
            <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px' }}>Envoyez exactement</div>
            <div style={{ fontSize: '28px', fontWeight: 900, color: '#6366F1', marginBottom: '12px' }}>
              {planData.priceFCFA.toLocaleString('fr-SN')} <small style={{ fontSize: '14px' }}>FCFA</small>
            </div>
            
            <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>au numéro Wave :</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #EAECF5' }}>
              <Smartphone size={18} color="#1DC8FF" />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{WAVE_NUMBER}</span>
              <button onClick={copyNumber} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                {copied ? <Check size={16} color="#10B981" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <label className="pm-phone-block" style={{ padding: 0 }}>
            <span className="pm-phone-label">Votre numéro Wave</span>
            <input
              type="tel"
              placeholder="77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EAECF5', marginBottom: '10px' }}
            />
          </label>
          
          <label className="pm-phone-block" style={{ padding: 0 }}>
            <span className="pm-phone-label">ID de transaction (optionnel)</span>
            <input
              type="text"
              placeholder="Ex: TXN123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #EAECF5' }}
            />
          </label>

          {error && <div className="pm-error" style={{ color: '#EF4444', fontSize: '13px', marginTop: '10px' }}>{error}</div>}
          
          <div style={{ display: 'flex', gap: '8px', padding: '12px', background: '#F8F9FD', borderRadius: '10px', fontSize: '12px', color: '#64748B', marginTop: '16px' }}>
            <Shield size={16} style={{ flexShrink: 0 }} />
            <span>Votre compte sera activé manuellement dès que nous aurons vérifié la réception des fonds.</span>
          </div>
        </div>

        <button
          className="btn pm-pay-btn"
          onClick={handleSubmit}
          disabled={loading}
          style={{ '--brand-color': '#1DC8FF', marginTop: '20px' }}
        >
          {loading ? (
            <><Loader2 size={18} className="spin" /> Envoi...</>
          ) : (
            <><Check size={16} /> J'ai effectué le paiement</>
          )}
        </button>
      </div>
    </div>
  );
}