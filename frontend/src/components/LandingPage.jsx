import { useState } from 'react';
import {
  Eye, Download, Shield, CheckCircle2, ArrowRight,
  Plus, Lock, Globe, Printer, Sparkles
} from 'lucide-react';
import Logo from './Logo';

/* ============================================
   HERO
   ============================================ */
function Hero({ onGetStarted }) {
  return (
    <section className="bf-hero">
      <div className="bf-hero-icon">
        <Plus size={20} strokeWidth={2.5} />
      </div>
      <h1 className="bf-hero-title">
        Là où naissent vos factures.
      </h1>
      <p className="bf-hero-sub">
        Un générateur de factures en ligne, pensé pour les freelances
        et les PME du Sénégal. Remplissez, prévisualisez, exportez en PDF.
      </p>
      <button className="bf-hero-cta" onClick={onGetStarted}>
        Créer ma première facture
      </button>
    </section>
  );
}

/* ============================================
   HERO VISUAL (invoice mockup)
   ============================================ */
function HeroVisual() {
  return (
    <section className="bf-hero-visual-wrap">
      <div className="bf-hero-visual">
        <div className="bf-hero-invoice">
          <div className="bf-invoice-topbar" />
          <div className="bf-invoice-head">
            <div>
              <div className="bf-invoice-co">Mon Entreprise SARL</div>
              <div className="bf-invoice-mail">contact@entreprise.sn</div>
            </div>
            <div className="bf-invoice-meta">
              <div className="bf-invoice-title">FACTURE</div>
              <div className="bf-invoice-num">N° INV-000042</div>
            </div>
          </div>
          <div className="bf-invoice-client">
            <div className="bf-invoice-label">FACTURÉ À</div>
            <div className="bf-invoice-client-name">Aly Diop · Dakar</div>
          </div>
          <div className="bf-invoice-lines">
            <div className="bf-invoice-line">
              <span>Prestation de service</span><span>50 000 FCFA</span>
            </div>
            <div className="bf-invoice-line">
              <span>Design graphique</span><span>25 000 FCFA</span>
            </div>
            <div className="bf-invoice-line">
              <span>TVA (18%)</span><span>13 500 FCFA</span>
            </div>
          </div>
          <div className="bf-invoice-total">
            <span>Total</span><strong>88 500 FCFA</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WHAT IS MAKEINVOICE?
   ============================================ */
function WhatIs() {
  return (
    <section className="bf-whatis">
      <div className="bf-whatis-left">
        <h2>Qu'est-ce que MakeInvoice ?</h2>
        <button
          className="bf-pill-dark"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Explorer les fonctionnalités
        </button>
      </div>
      <div className="bf-whatis-right">
        <p>
          MakeInvoice est un outil en ligne qui vous permet de créer des factures
          professionnelles en quelques minutes. Vous renseignez vos informations,
          celles de votre client, et vos lignes de prestation — l'aperçu se
          construit en direct. Vous pouvez calculer la TVA, appliquer des remises,
          et exporter la facture en PDF pour l'envoyer à votre client.
        </p>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE CARDS
   ============================================ */
function FeatureCards() {
  return (
    <section className="bf-features" id="features">
      <div className="bf-feature-grid">
        {/* Big card with visual */}
        <div className="bf-feature-card bf-feature-card--big">
          <h3>Aperçu en direct</h3>
          <p>
            Chaque champ rempli met instantanément à jour votre facture.
            Voyez exactement le rendu final avant d'exporter.
          </p>
          <div className="bf-feature-visual">
            <div className="bf-preview-box">
              <div className="bf-preview-row">
                <span className="bf-preview-label">N°</span>
                <span className="bf-preview-value">INV-000042</span>
              </div>
              <div className="bf-preview-row">
                <span className="bf-preview-label">Client</span>
                <span className="bf-preview-value">Aly Diop</span>
              </div>
              <div className="bf-preview-row">
                <span className="bf-preview-label">Total</span>
                <span className="bf-preview-value bf-preview-total">88 500 FCFA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dark card 1 */}
        <div className="bf-feature-card bf-feature-card--dark">
          <h3>Export PDF instantané</h3>
          <p>
            Téléchargez ou imprimez votre facture en PDF haute qualité.
            Prête à envoyer à votre client par email ou WhatsApp.
          </p>
        </div>

        {/* Dark card 2 */}
        <div className="bf-feature-card bf-feature-card--dark">
          <h3>TVA & remises</h3>
          <p>
            Calculez automatiquement la TVA (18% par défaut) et appliquez
            des remises. Le total se met à jour tout seul.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TRUST STRIP
   ============================================ */
function TrustStrip() {
  const items = [
    { icon: <Lock size={16} />, label: 'Données chiffrées' },
    { icon: <Shield size={16} />, label: 'Conforme TVA 18%' },
    { icon: <Globe size={16} />, label: 'Pensé pour le Sénégal' },
    { icon: <Printer size={16} />, label: 'Export PDF illimité' },
  ];
  return (
    <section className="bf-trust">
      <div className="bf-trust-label">Conçu pour la confiance</div>
      <div className="bf-trust-row">
        {items.map((it, i) => (
          <span key={i} className="bf-trust-item">
            {it.icon} {it.label}
          </span>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   USE CASES
   ============================================ */
function UseCases({ onGetStarted }) {
  return (
    <section className="bf-usecases">
      <div className="bf-usecases-left">
        <div className="bf-usecases-eyebrow">Cas d'usage</div>
        <h2>Pour qui est MakeInvoice ?</h2>
        <p>
          Que vous soyez freelance, consultant, artisan ou à la tête
          d'une petite entreprise — si vous devez facturer, MakeInvoice
          vous fait gagner du temps.
        </p>
      </div>

      {/* ✅ Now a real button — click anywhere to start */}
      <button
        type="button"
        className="bf-usecases-card"
        onClick={onGetStarted}
        aria-label="Commencer avec MakeInvoice pour Freelances et Consultants"
      >
        <h3>Freelances & Consultants</h3>
        <p>
          Créez une facture pour chaque mission, avec vos coordonnées et
          celles de votre client. Exportez en PDF et envoyez.
        </p>
        <div className="bf-usecases-arrow">
          <ArrowRight size={18} />
        </div>
      </button>
    </section>
  );
}
/* ============================================
   PRICING
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
    <section className="bf-pricing" id="pricing">
      <div className="bf-pricing-head">
        <div className="bf-usecases-eyebrow">Tarifs</div>
        <h2>Des prix simples. Aucune surprise.</h2>
        <p>Payez par Wave, Orange Money, Mixx by Yas ou carte. Annulable à tout moment.</p>
      </div>

      <div className="bf-pricing-grid">
        {plans.map(p => (
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
              Choisir {p.name} <ArrowRight size={15} />
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
    <section className="bf-final">
      <Sparkles size={26} className="bf-final-icon" />
      <h2>Prêt à créer votre première facture ?</h2>
      <p>Inscription gratuite. Aucune carte bancaire requise.</p>
      <button className="bf-hero-cta" onClick={onGetStarted}>
        Commencer maintenant
      </button>
    </section>
  );
}

/* ============================================
   MAIN
   ============================================ */
export default function LandingPage({ onGetStarted }) {
  return (
    <div className="landing-page">
      <header className="bf-nav">
        <Logo size={30} />
        <nav className="bf-nav-links">
          <a href="#features">Fonctionnalités</a>
          <a href="#pricing">Tarifs</a>
        </nav>
        <button className="bf-pill-dark" onClick={onGetStarted}>
          Créer un compte
        </button>
      </header>

      <main>
        <Hero onGetStarted={onGetStarted} />
        <HeroVisual />
        <WhatIs />
        <FeatureCards />
        <TrustStrip />
        <UseCases />
        <Pricing onGetStarted={onGetStarted} />
        <FinalCTA onGetStarted={onGetStarted} />
      </main>

      <footer className="bf-footer">
        <Logo size={26} />
        <p>© {new Date().getFullYear()} MakeInvoice — Générateur de factures pour le Sénégal.</p>
      </footer>
    </div>
  );
}