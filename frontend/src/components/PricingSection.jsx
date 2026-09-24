import { Check, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    key: 'starter', name: 'Starter', priceUSD: 7, priceFCFA: 4500, limit: 10,
    features: ['10 factures / mois', 'Export PDF', 'Support email'],
  },
  {
    key: 'pro', name: 'Pro', priceUSD: 12, priceFCFA: 7500, limit: 30,
    features: ['30 factures / mois', 'Tous les modèles', 'Export PDF & CSV', 'Support prioritaire'],
    popular: true,
  },
  {
    key: 'business', name: 'Business', priceUSD: 20, priceFCFA: 12000, limit: 100,
    features: ['100 factures / mois', 'API & intégrations', 'Support dédié', 'Multi-utilisateurs'],
  },
];

export default function PricingSection({ currentPlan, onSelect }) {
  return (
    <section id="pricing" className="pricing-section">
      <h2>Des tarifs <span>simples et honnêtes</span></h2>
      <p className="pricing-sub">
        Paiement via Wave, Orange Money, Free Money ou carte bancaire.
      </p>

      <div className="pricing-grid">
        {PLANS.map(p => {
          const isCurrent = currentPlan === p.key;
          return (
            <div
              key={p.key}
              className={`pricing-card ${isCurrent ? 'active' : ''} ${p.popular ? 'popular' : ''}`}
            >
              {p.popular && <div className="popular-badge">Recommandé</div>}

              <div className="pricing-card-head">
                <h3>{p.name}</h3>
                <div className="price">
                  <span className="price-usd">{p.priceUSD}</span>
                  <span className="price-fcfa">
                    {p.priceFCFA.toLocaleString('fr-SN')} FCFA / mois
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
                  'Plan actuel'
                ) : (
                  <>
                    Choisir ce plan
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