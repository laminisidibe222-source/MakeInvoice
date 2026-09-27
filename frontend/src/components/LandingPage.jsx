import {
  FileText, Eye, Download, Shield, CheckCircle2, ArrowRight,
  Lock, Globe, Printer, Sparkles, Palette, Send,
} from 'lucide-react';
import Logo from './Logo';

/* ============================================
   NAV — all links are real anchors
   ============================================ */
function Nav({ onGetStarted }) {
  return (
    <header className="jl-nav">
      <Logo size={28} />

      <nav className="jl-nav-links">
        <a href="#fonctionnalites">Fonctionnalités</a>
        <a href="#cas-usage">Cas d'usage</a>
        <a href="#tarifs">Tarifs</a>
      </nav>

      <button className="jl-nav-cta" onClick={onGetStarted}>
        Se connecter
      </button>
    </header>
  );
}

/* ============================================
   HERO
   ============================================ */
function Hero({ onGetStarted }) {
  return (
    <section className="jl-hero">
      <div className="jl-hero-inner">
        <div className="jl-hero-text">
          <h1 className="jl-hero-title">
            Vos factures,<br />
            <em>avec élégance.</em>
          </h1>
          <p className="jl-hero-sub">
            Générez, personnalisez et exportez vos factures
            professionnelles en moins de deux minutes.
            Conçu pour les freelances et PME du Sénégal.
          </p>
          <button className="jl-btn-primary" onClick={onGetStarted}>
            Commencer maintenant
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="jl-hero-visual">
          <div className="jl-invoice-mock">
            <div className="jl-invoice-top">
              <span className="jl-invoice-brand">Mon Entreprise SARL</span>
              <span className="jl-invoice-num">N° INV-042</span>
            </div>
            <div className="jl-invoice-client">
              <span className="jl-invoice-label">FACTURÉ À</span>
              <strong>Aly Diop · Dakar</strong>
            </div>
            <div className="jl-invoice-lines">
              <div><span>Prestation de service</span><span>50 000 FCFA</span></div>
              <div><span>Design graphique</span><span>25 000 FCFA</span></div>
              <div><span>TVA (18%)</span><span>13 500 FCFA</span></div>
            </div>
            <div className="jl-invoice-total">
              <span>Total</span>
              <strong>88 500 FCFA</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   QUICK STRIP
   ============================================ */
function QuickStrip() {
  const items = [
    { icon: <Eye size={18} />, label: 'Aperçu en direct', value: 'Voyez la facture se construire' },
    { icon: <Download size={18} />, label: 'Export PDF', value: 'Téléchargez en 1 clic' },
    { icon: <Palette size={18} />, label: 'TVA & remises', value: 'Calculs automatiques' },
  ];

  return (
    <section className="jl-strip">
      <div className="jl-strip-inner">
        {items.map((it, i) => (
          <div className="jl-strip-item" key={i}>
            <div className="jl-strip-icon">{it.icon}</div>
            <div>
              <div className="jl-strip-label">{it.label}</div>
              <div className="jl-strip-value">{it.value}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   WHAT IS
   ============================================ */
function WhatIs() {
  return (
    <section className="jl-whatis">
      <h2 className="jl-title-center">
        Ce que MakeInvoice<br /> fait pour vous
      </h2>

      <div className="jl-two-col">
        <div className="jl-text-col">
          <p>
            MakeInvoice est un générateur de factures en ligne, pensé
            pour le marché sénégalais. Renseignez vos informations, celles
            de votre client, et vos lignes de prestation — l'aperçu se
            construit en direct.
          </p>
          <p>
            Ajoutez la TVA (18 % par défaut), appliquez des remises, puis
            exportez votre facture en PDF haute qualité, prête à envoyer
            par email ou WhatsApp.
          </p>
        </div>

        <div className="jl-visual-col">
          <div className="jl-preview-block">
            <div className="jl-preview-row">
              <span className="jl-preview-label">N°</span>
              <span className="jl-preview-value">INV-000042</span>
            </div>
            <div className="jl-preview-row">
              <span className="jl-preview-label">Client</span>
              <span className="jl-preview-value">Aly Diop</span>
            </div>
            <div className="jl-preview-row">
              <span className="jl-preview-label">TVA</span>
              <span className="jl-preview-value">18 %</span>
            </div>
            <div className="jl-preview-row jl-preview-row--total">
              <span className="jl-preview-label">Total</span>
              <span className="jl-preview-value jl-preview-total">88 500 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE CARDS — no fake links, just real content
   ============================================ */
function FeatureCards() {
  const items = [
    {
      icon: <Eye size={20} />,
      title: 'Aperçu en direct',
      desc: "Chaque champ rempli met instantanément à jour votre facture. Voyez le rendu final avant d'exporter.",
    },
    {
      icon: <Download size={20} />,
      title: 'Export PDF instantané',
      desc: "Téléchargez ou imprimez votre facture en PDF haute qualité. Prête à envoyer à votre client.",
    },
    {
      icon: <Shield size={20} />,
      title: 'TVA & remises automatiques',
      desc: "Le calcul de la TVA (18 %) et des remises se fait tout seul. Aucun risque d'erreur.",
    },
  ];

  return (
    <section className="jl-features" id="fonctionnalites">
      <div className="jl-features-grid">
        {items.map((f, i) => (
          <div className="jl-feature-card" key={i}>
            <div className="jl-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   USE CASES
   ============================================ */
function SectionUseCases() {
  return (
    <section className="jl-usecases" id="cas-usage">
      <h2 className="jl-title-center">Pour qui ?</h2>

      <div className="jl-two-col jl-two-col--reverse">
        <div className="jl-visual-col">
          <div className="jl-usecases-visual">
            <div className="jl-usecases-visual-inner">
              <FileText size={28} className="jl-usecases-visual-icon" />
              <div className="jl-usecases-visual-title">
                Facture prête à envoyer
              </div>
              <div className="jl-usecases-visual-sub">
                Générée en 2 min · PDF · 88 500 FCFA
              </div>
            </div>
          </div>
        </div>

        <div className="jl-text-col">
          <h3 className="jl-subheading">Freelances & Consultants</h3>
          <p>
            Créez une facture pour chaque mission, avec vos coordonnées
            et celles de votre client. Exportez en PDF et envoyez — sans
            tableur, sans logiciel compliqué.
          </p>

          <h3 className="jl-subheading">Petites entreprises</h3>
          <p>
            Gérez vos factures simplement. Historique, TVA, remises,
            export — tout ce dont vous avez besoin pour facturer
            proprement.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRICING — real section, real prices
   ============================================ */
function Pricing({ onGetStarted }) {
  const plans = [
    {
      key: 'starter', name: 'Starter', priceUSD: 7, priceFCFA: 4500,
      features: ['10 factures / mois', 'Export PDF', 'TVA & remises', 'Support email'],
    },
    {
      key: 'pro', name: 'Pro', priceUSD: 12, priceFCFA: 7500,
      features: ['30 factures / mois', 'Tous les modèles', 'Export PDF & CSV', 'Support prioritaire'],
      popular: true,
    },
    {
      key: 'business', name: 'Business', priceUSD: 20, priceFCFA: 12000,
      features: ['100 factures / mois', 'API & intégrations', 'Support dédié', 'Multi-utilisateurs'],
    },
  ];

  return (
    <section className="bf-pricing" id="tarifs">
      <div className="bf-pricing-head">
        <h2>Des prix simples. Aucune surprise.</h2>
        <p>Payez par Wave, Orange Money, Mixx by Yas ou carte. Annulable à tout moment.</p>
      </div>

      <div className="bf-pricing-grid">
        {plans.map((p) => (
          <div key={p.key} className={`bf-plan ${p.popular ? 'bf-plan--popular' : ''}`}>
            {p.popular && <div className="bf-plan-badge">Recommandé</div>}
            <div className="bf-plan-name">{p.name}</div>
            <div className="bf-plan-price">
              <span className="bf-plan-usd">${p.priceUSD}</span>
              <span className="bf-plan-fcfa">{p.priceFCFA.toLocaleString('fr-SN')} FCFA / mois</span>
            </div>
            <ul className="bf-plan-features">
              {p.features.map((f, i) => (
                <li key={i}><CheckCircle2 size={15} /> {f}</li>
              ))}
            </ul>
            <button className="bf-plan-btn" onClick={onGetStarted}>
              Choisir {p.name}
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   FINAL CTA
   ============================================ */
function FinalCTA({ onGetStarted }) {
  return (
    <section className="jl-final">
      <div className="jl-final-inner">
        <Sparkles size={28} className="jl-final-icon" />
        <h2>Prêt à créer votre<br /> première facture ?</h2>
        <p>Inscription gratuite. Aucune carte bancaire requise.</p>

        <div className="jl-final-badges">
          <span className="jl-final-badge"><Lock size={12} /> Sécurisé</span>
          <span className="jl-final-badge"><Globe size={12} /> Sénégal</span>
          <span className="jl-final-badge"><Printer size={12} /> PDF</span>
        </div>

        <button className="jl-btn-primary jl-btn-primary--light" onClick={onGetStarted}>
          Commencer maintenant
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER — only real links
   ============================================ */
function Footer({ onGetStarted }) {
  return (
    <footer className="jl-footer">
      <div className="jl-footer-inner">
        <div className="jl-footer-col jl-footer-col--brand">
          <Logo size={28} />
          <p>
            Générateur de factures en ligne pour les freelances
            et PME du Sénégal.
          </p>
        </div>

        <div className="jl-footer-col">
          <h4>Produit</h4>
          <ul>
            <li><a href="#fonctionnalites">Fonctionnalités</a></li>
            <li><a href="#cas-usage">Cas d'usage</a></li>
            <li><a href="#tarifs">Tarifs</a></li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>Compte</h4>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Se connecter</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Créer un compte</a></li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>Contact</h4>
          <ul>
            <li>
              <a href="mailto:contact@makeinvoice.app">contact@makeinvoice.app</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="jl-footer-bottom">
        © {new Date().getFullYear()} MakeInvoice — Tous droits réservés.
      </div>
    </footer>
  );
}

/* ============================================
   MAIN
   ============================================ */
export default function LandingPage({ onGetStarted }) {
  return (
    <div className="jl-page">
      <Nav onGetStarted={onGetStarted} />
      <main>
        <Hero onGetStarted={onGetStarted} />
        <QuickStrip />
        <WhatIs />
        <FeatureCards />
        <SectionUseCases />
        <Pricing onGetStarted={onGetStarted} />
        <FinalCTA onGetStarted={onGetStarted} />
      </main>
      <Footer onGetStarted={onGetStarted} />
    </div>
  );
}