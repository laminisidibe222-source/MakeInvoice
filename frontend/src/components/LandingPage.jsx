import {
  FileText, Eye, Download, Shield, CheckCircle2, ArrowRight,
  Lock, Globe, Printer, Sparkles, Palette,
} from 'lucide-react';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import { useLang } from '../i18n/LanguageContext';

/* ============================================
   NAV
   ============================================ */
function Nav({ onGetStarted }) {
  const { t } = useLang();
  return (
    <header className="jl-nav">
      <Logo size={28} />

      <nav className="jl-nav-links">
        <a href="#fonctionnalites">{t('nav.features')}</a>
        <a href="#cas-usage">{t('nav.useCases')}</a>
        <a href="#tarifs">{t('nav.pricing')}</a>
      </nav>

      <div className="jl-nav-right">
        <LanguageSwitcher />
        <button className="jl-nav-cta" onClick={onGetStarted}>
          {t('nav.login')}
        </button>
      </div>
    </header>
  );
}

/* ============================================
   HERO
   ============================================ */
function Hero({ onGetStarted }) {
  const { t } = useLang();
  return (
    <section className="jl-hero">
      <div className="jl-hero-inner">
        <div className="jl-hero-text">
          <h1 className="jl-hero-title">
            {t('hero.titleLine1')}<br />
            <em>{t('hero.titleLine2')}</em>
          </h1>
          <p className="jl-hero-sub">{t('hero.subtitle')}</p>
          <button className="jl-btn-primary" onClick={onGetStarted}>
            {t('hero.cta')}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="jl-hero-visual">
          <div className="jl-invoice-mock">
            <div className="jl-invoice-top">
              <span className="jl-invoice-brand">Acme Studio</span>
              <span className="jl-invoice-num">N° INV-042</span>
            </div>
            <div className="jl-invoice-client">
              <span className="jl-invoice-label">{t('preview.billedTo')}</span>
              <strong>John Smith</strong>
            </div>
            <div className="jl-invoice-lines">
              <div><span>Consulting service</span><span>50 000 FCFA</span></div>
              <div><span>Graphic design</span><span>25 000 FCFA</span></div>
              <div><span>{t('whatIs.previewVat')} (18%)</span><span>13 500 FCFA</span></div>
            </div>
            <div className="jl-invoice-total">
              <span>{t('preview.grandTotal')}</span>
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
  const { t } = useLang();
  const items = [
    { icon: <Eye size={18} />, label: t('quickStrip.livePreview'), value: t('quickStrip.livePreviewDesc') },
    { icon: <Download size={18} />, label: t('quickStrip.pdfExport'), value: t('quickStrip.pdfExportDesc') },
    { icon: <Palette size={18} />, label: t('quickStrip.vatDiscounts'), value: t('quickStrip.vatDiscountsDesc') },
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
  const { t } = useLang();
  return (
    <section className="jl-whatis">
      <h2 className="jl-title-center">
        {t('whatIs.title1')}<br /> {t('whatIs.title2')}
      </h2>

      <div className="jl-two-col">
        <div className="jl-text-col">
          <p>{t('whatIs.p1')}</p>
          <p>{t('whatIs.p2')}</p>
        </div>

        <div className="jl-visual-col">
          <div className="jl-preview-block">
            <div className="jl-preview-row">
              <span className="jl-preview-label">{t('whatIs.previewNum')}</span>
              <span className="jl-preview-value">INV-000042</span>
            </div>
            <div className="jl-preview-row">
              <span className="jl-preview-label">{t('whatIs.previewClient')}</span>
              <span className="jl-preview-value">John Smith</span>
            </div>
            <div className="jl-preview-row">
              <span className="jl-preview-label">{t('whatIs.previewVat')}</span>
              <span className="jl-preview-value">18 %</span>
            </div>
            <div className="jl-preview-row jl-preview-row--total">
              <span className="jl-preview-label">{t('whatIs.previewTotal')}</span>
              <span className="jl-preview-value jl-preview-total">88 500 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURE CARDS
   ============================================ */
function FeatureCards() {
  const { t } = useLang();
  const items = [
    { icon: <Eye size={20} />, title: t('features.liveTitle'), desc: t('features.liveDesc') },
    { icon: <Download size={20} />, title: t('features.pdfTitle'), desc: t('features.pdfDesc') },
    { icon: <Shield size={20} />, title: t('features.vatTitle'), desc: t('features.vatDesc') },
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
  const { t } = useLang();
  return (
    <section className="jl-usecases" id="cas-usage">
      <h2 className="jl-title-center">{t('useCases.title')}</h2>

      <div className="jl-two-col jl-two-col--reverse">
        <div className="jl-visual-col">
          <div className="jl-usecases-visual">
            <div className="jl-usecases-visual-inner">
              <FileText size={28} className="jl-usecases-visual-icon" />
              <div className="jl-usecases-visual-title">
                {t('useCases.readyTitle')}
              </div>
              <div className="jl-usecases-visual-sub">
                {t('useCases.readyDesc')}
              </div>
            </div>
          </div>
        </div>

        <div className="jl-text-col">
          <h3 className="jl-subheading">{t('useCases.freelancers')}</h3>
          <p>{t('useCases.freelancersDesc')}</p>

          <h3 className="jl-subheading">{t('useCases.smallBusiness')}</h3>
          <p>{t('useCases.smallBusinessDesc')}</p>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   PRICING
   ============================================ */
function Pricing({ onGetStarted }) {
  const { t } = useLang();
  const plans = [
    {
      key: 'starter', name: t('pricing.starter'), priceUSD: 7, priceFCFA: 4500,
      features: [t('pricing.feat10'), t('pricing.featPdf'), t('pricing.featVat'), t('pricing.featEmail')],
    },
    {
      key: 'pro', name: t('pricing.pro'), priceUSD: 12, priceFCFA: 7500,
      features: [t('pricing.feat30'), t('pricing.featAllTemplates'), t('pricing.featPdfCsv'), t('pricing.featPriority')],
      popular: true,
    },
    {
      key: 'business', name: t('pricing.business'), priceUSD: 20, priceFCFA: 12000,
      features: [t('pricing.feat100'), t('pricing.featApi'), t('pricing.featDedicated'), t('pricing.featMulti')],
    },
  ];

  return (
    <section className="bf-pricing" id="tarifs">
      <div className="bf-pricing-head">
        <h2>{t('pricing.title')}</h2>
        <p>{t('pricing.subtitle')}</p>
      </div>

      <div className="bf-pricing-grid">
        {plans.map((p) => (
          <div key={p.key} className={`bf-plan ${p.popular ? 'bf-plan--popular' : ''}`}>
            {p.popular && <div className="bf-plan-badge">{t('pricing.recommended')}</div>}
            <div className="bf-plan-name">{p.name}</div>
            <div className="bf-plan-price">
              <span className="bf-plan-usd">${p.priceUSD}</span>
              <span className="bf-plan-fcfa">
                {p.priceFCFA.toLocaleString('fr-SN')} {t('pricing.perMonth')}
              </span>
            </div>
            <ul className="bf-plan-features">
              {p.features.map((f, i) => (
                <li key={i}><CheckCircle2 size={15} /> {f}</li>
              ))}
            </ul>
            <button className="bf-plan-btn" onClick={onGetStarted}>
              {t('pricing.choose')} {p.name}
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
  const { t } = useLang();
  return (
    <section className="jl-final">
      <div className="jl-final-inner">
        <Sparkles size={28} className="jl-final-icon" />
        <h2>{t('finalCta.title1')}<br /> {t('finalCta.title2')}</h2>
        <p>{t('finalCta.subtitle')}</p>

        <div className="jl-final-badges">
          <span className="jl-final-badge"><Lock size={12} /> {t('finalCta.secure')}</span>
          <span className="jl-final-badge"><Globe size={12} /> {t('finalCta.senegal')}</span>
          <span className="jl-final-badge"><Printer size={12} /> {t('finalCta.pdf')}</span>
        </div>

        <button className="jl-btn-primary jl-btn-primary--light" onClick={onGetStarted}>
          {t('finalCta.cta')}
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
   ============================================ */
function Footer({ onGetStarted }) {
  const { t } = useLang();
  return (
    <footer className="jl-footer">
      <div className="jl-footer-inner">
        <div className="jl-footer-col jl-footer-col--brand">
          <Logo size={28} />
          <p>{t('footer.tagline')}</p>
        </div>

        <div className="jl-footer-col">
          <h4>{t('footer.product')}</h4>
          <ul>
            <li><a href="#fonctionnalites">{t('footer.features')}</a></li>
            <li><a href="#cas-usage">{t('footer.useCases')}</a></li>
            <li><a href="#tarifs">{t('footer.pricing')}</a></li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>{t('footer.account')}</h4>
          <ul>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>
                {t('footer.login')}
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>
                {t('footer.signup')}
              </a>
            </li>
          </ul>
        </div>

        <div className="jl-footer-col">
          <h4>{t('footer.contact')}</h4>
          <ul>
            <li>
              <a href="mailto:contact@makeinvoice.app">contact@makeinvoice.app</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="jl-footer-bottom">
        © {new Date().getFullYear()} MakeInvoice — {t('footer.rights')}
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