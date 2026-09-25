import {
  FileText, Eye, Download, Shield, CheckCircle2, ArrowRight,
  Lock, Globe, Printer, Sparkles, Palette, Send
} from 'lucide-react';
import Logo from './Logo';

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
   QUICK STRIP — 3 mini features
   ============================================ */
function QuickStrip() {
  const items = [
    {
      icon: <Eye size={18} />,
      label: 'Aperçu en direct',
      value: 'Voyez la facture se construire',
    },
    {
      icon: <Download size={18} />,
      label: 'Export PDF',
      value: 'Téléchargez en 1 clic',
    },
    {
      icon: <Palette size={18} />,
      label: 'TVA & remises',
      value: 'Calculs automatiques',
    },
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
   FEATURE CARDS — 3 rounded
   ============================================ */
function FeatureCards() {
  const items = [
    {
      icon: <Eye size={20} />,
      title: 'Aperçu en direct',
      desc: "Chaque champ rempli met instantanément à jour votre facture. Voyez le rendu final avant d'exporter.",
      link: 'Voir la démo',
    },
    {
      icon: <Download size={20} />,
      title: 'Export PDF instantané',
      desc: "Téléchargez ou imprimez votre facture en PDF haute qualité. Prête à envoyer à votre client.",
      link: 'En savoir plus',
    },
    {
      icon: <Shield size={20} />,
      title: 'TVA & remises automatiques',
      desc: "Le calcul de la TVA (18 %) et des remises se fait tout seul. Aucun risque d'erreur.",
      link: 'Découvrir',
    },
  ];

  return (
    <section className="jl-features">
      <div className="jl-features-grid">
        {items.map((f, i) => (
          <div className="jl-feature-card" key={i}>
            <div className="jl-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
            <div className="jl-feature-link">
              {f.link}
              <ArrowRight size={14} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   TRUST / SECTION
   ============================================ */
function SectionUseCases() {
  return (
    <section className="jl-usecases">
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
   FINAL CTA — dark green block
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
   FOOTER
   ============================================ */
function Footer() {
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
            <li>Fonctionnalités</li>
            <li>Tarifs</li>
            <li>Cas d'usage</li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>Ressources</h4>
          <ul>
            <li>Guide de démarrage</li>
            <li>Support</li>
            <li>Contact</li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>Légal</h4>
          <ul>
            <li>Conditions</li>
            <li>Confidentialité</li>
            <li>Cookies</li>
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
      <header className="jl-nav">
        <Logo size={28} />
        <nav className="jl-nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#how">Cas d'usage</a>
          <a href="#pricing">Tarifs</a>
        </nav>
        <button className="jl-nav-cta" onClick={onGetStarted}>
          Commencer
        </button>
      </header>

      <main>
        <Hero onGetStarted={onGetStarted} />
        <QuickStrip />
        <WhatIs />
        <FeatureCards />
        <SectionUseCases />
        <FinalCTA onGetStarted={onGetStarted} />
      </main>

      <Footer />
    </div>
  );
}