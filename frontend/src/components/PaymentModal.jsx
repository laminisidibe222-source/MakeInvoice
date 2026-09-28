import { useState } from 'react';
import { CreditCard, Loader2, Shield, Check, X } from 'lucide-react';
import { apiFetch } from '../supabase';
import {
  WaveLogo, OrangeMoneyLogo, MixxByYasLogo, CardLogo,
} from './BrandLogos';
import { useLang } from '../i18n/LanguageContext';

const PLANS = {
  starter:  { name: 'Starter',  priceFCFA: 4500,  limit: 10 },
  pro:      { name: 'Pro',      priceFCFA: 7500,  limit: 30 },
  business: { name: 'Business', priceFCFA: 12000, limit: 100 },
};

export default function PaymentModal({ plan, onClose, onSuccess, showToast }) {
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('wave');
  const [phone, setPhone] = useState('');
  const planData = PLANS[plan];

  const METHODS = [
    { key: 'wave', label: t('payment.wave'), desc: t('payment.waveDesc'), Logo: WaveLogo, color: '#1DC8FF', requiresPhone: true },
    { key: 'orange', label: t('payment.orange'), desc: t('payment.orangeDesc'), Logo: OrangeMoneyLogo, color: '#FF7900', requiresPhone: true },
    { key: 'mixx', label: t('payment.mixx'), desc: t('payment.mixxDesc'), Logo: MixxByYasLogo, color: '#0066FF', requiresPhone: true },
    { key: 'card', label: t('payment.card'), desc: t('payment.cardDesc'), Logo: CardLogo, color: '#6366F1', requiresPhone: false },
  ];

  const activeMethod = METHODS.find(m => m.key === method);

  const phoneValid =
    !activeMethod.requiresPhone ||
    /^(?:\+?221)?[ ]?7[05678][ ]?\d{3}[ ]?\d{2}[ ]?\d{2}$/.test(phone.replace(/\s/g, ''));

  const handlePay = async () => {
    if (!phoneValid) {
      showToast('Enter a valid Senegalese number (e.g., 77 123 45 67)', 'error');
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
        <button className="modal-close" onClick={onClose} disabled={loading} aria-label="Close">
          <X size={18} />
        </button>

        <div className="pm-header">
          <div className="pm-plan-badge">{t('payment.plan')} {planData.name}</div>
          <h3 className="pm-title">{t('payment.finalize')}</h3>
          <p className="pm-subtitle">
            {t('payment.monthlyPlan')} · {planData.limit} {t('payment.invoices')}
          </p>
        </div>

        <div className="pm-scroll">
          <div className="pm-summary">
            <div className="pm-summary-row">
              <span className="pm-summary-label">{t('payment.totalToPay')}</span>
              <span className="pm-summary-price">
                {planData.priceFCFA.toLocaleString('fr-SN')}
                <small>FCFA</small>
              </span>
            </div>
            <div className="pm-summary-note">
              <Shield size={13} /> {t('payment.secure')}
            </div>
          </div>

          <div className="pm-section-label">{t('payment.paymentMethod')}</div>
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

          {activeMethod.requiresPhone && (
            <div className="pm-phone-block">
              <label className="pm-phone-label">
                {t('payment.phoneLabel')} {activeMethod.label}
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
                {t('payment.phoneHint')}
              </p>
            </div>
          )}
        </div>

        <button
          className="btn pm-pay-btn"
          onClick={handlePay}
          disabled={loading || !phoneValid}
          style={{ '--brand-color': activeMethod.color }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              {t('payment.payLoading')} {activeMethod.label}...
            </>
          ) : (
            <>
              <CreditCard size={18} />
              {t('payment.pay')} {planData.priceFCFA.toLocaleString('fr-SN')} FCFA
            </>
          )}
        </button>

        <button className="pm-cancel" onClick={onClose} disabled={loading}>
          {t('payment.cancel')}
        </button>

        <p className="pm-legal">{t('payment.legal')}</p>
      </div>
    </div>
  );
}