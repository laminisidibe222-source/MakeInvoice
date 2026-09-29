import { Check, ArrowRight } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

export default function PricingSection({ currentPlan, onSelect }) {
  const { t } = useLang();

  const plans = [
    {
      key: 'starter',
      name: t('pricing.starter'),
      priceUSD: 7,
      priceFCFA: 4500,
      features: [
        t('pricing.feat10'),
        t('pricing.featPdf'),
        t('pricing.featVat'),
        t('pricing.featEmail'),
      ],
    },
    {
      key: 'pro',
      name: t('pricing.pro'),
      priceUSD: 12,
      priceFCFA: 7500,
      features: [
        t('pricing.feat30'),
        t('pricing.featAllTemplates'),
        t('pricing.featPdfCsv'),
        t('pricing.featPriority'),
      ],
      popular: true,
    },
    {
      key: 'business',
      name: t('pricing.business'),
      priceUSD: 20,
      priceFCFA: 12000,
      features: [
        t('pricing.feat100'),
        t('pricing.featApi'),
        t('pricing.featDedicated'),
        t('pricing.featMulti'),
      ],
    },
  ];

  return (
    <section id="pricing" className="pricing-section">
      <h2>
        {t('pricing.title')}
      </h2>
      <p className="pricing-sub">
        {t('pricing.subtitle')}
      </p>

      <div className="pricing-grid">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          return (
            <div
              key={p.key}
              className={`pricing-card ${isCurrent ? 'active' : ''} ${p.popular ? 'popular' : ''}`}
            >
              {p.popular && <div className="popular-badge">{t('pricing.recommended')}</div>}

              <div className="pricing-card-head">
                <h3>{p.name}</h3>
                <div className="price">
                  <span className="price-usd">{p.priceUSD}</span>
                  <span className="price-fcfa">
                    {p.priceFCFA.toLocaleString('fr-SN')} {t('pricing.perMonth')}
                  </span>
                </div>
              </div>

              <ul className="features">
                {p.features.map((f, i) => (
                  <li key={i}>
                    <span className="feature-check">
                      <Check size={12} strokeWidth={3.5} />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="btn-plan"
                onClick={() => onSelect(p.key)}
                disabled={isCurrent}
              >
                {isCurrent ? (
                  t('pricing.currentPlan')
                ) : (
                  <>
                    {t('pricing.choose')} {p.name}
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}