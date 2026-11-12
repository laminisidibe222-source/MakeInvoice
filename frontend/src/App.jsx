import { useEffect, useRef, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { apiFetch } from './lib/api.js';
import { formatMoney } from './utils/currencies';
import { useLang } from './i18n/LanguageContext';
import Auth from './components/Auth';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import PricingSection from './components/PricingSection';
import PaymentModal from './components/PaymentModal';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import History from './components/History';
import LanguageSwitcher from './components/LanguageSwitcher';
import {
  BarChart3, TrendingUp,
  FileCheck2, CheckCircle2, Lock, ArrowUpRight, Moon, Sun, Menu,
} from 'lucide-react';
import './App.css';

const DEFAULT_INVOICE = {
  company: { name: '', address: '', email: '', phone: '' },
  client: { name: '', address: '', email: '', phone: '' },
  number: 'INV-' + String(Date.now()).slice(-6),
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  items: [{ description: '', quantity: 1, unitPrice: 0 }],
  taxRate: 18,
  discount: 0,
  notes: 'Merci pour votre confiance.',
};

function App() {
  const { session, profile, loading, signOut, refreshProfile } = useAuth();
  const [invoice, setInvoice] = useState(DEFAULT_INVOICE);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const prefilledRef = useRef(false);


  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const { t } = useLang();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));


  // Prefill the invoice company identity once, when the profile arrives.
  useEffect(() => {
    if (!profile || prefilledRef.current) return;
    prefilledRef.current = true;
    setInvoice((prev) => ({
      ...prev,
      company: {
        name: profile.company_name || '',
        address: profile.company_address || '',
        email: profile.email || '',
        phone: profile.company_phone || '',
      },
    }));
  }, [profile]);

  const handleLogout = () => {
    signOut();
    setInvoice(DEFAULT_INVOICE);
    setShowAuth(false);   // ← land on the landing page after sign-out
  };
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  if (loading) {
  return <div className="loading-screen"><div className="spinner" /></div>;
}

// Show the landing page if the user is not logged in and hasn't clicked "Get Started"
if (!session && !showAuth) {
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}

// Show the auth screen (sign up / login)
if (!session) {
  return <Auth />;
}

 return (
  <div className="mi-app-shell">
    <Sidebar
      isOpen={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      onLogout={handleLogout}
    />

    <div className="mi-app-main">
      <header className="mi-topbar">
        <div className="mi-topbar-left">
            <button
              className="mi-hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>

            <div className="mi-status-pill">
              <span className="mi-status-dot" />
              <span>{t('topbar.mode')}</span>
            </div>
        </div>

        <div className="mi-topbar-right">
          {profile && (
            <div className="mi-quota-pill">
              <span className="mi-quota-value">
                {profile.invoices_generated}
                <span className="mi-quota-sep">/</span>
                {profile.invoices_limit}
              </span>
              <span className="mi-quota-label">{t('topbar.invoices')}</span>
            </div>
          )}

          <LanguageSwitcher />

          <button
            className="mi-icon-btn"
            type="button"
            onClick={toggleTheme}
            aria-label="Changer le thème"
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      <div className="mi-content">
        <Routes>
          <Route path="/" element={<Dashboard profile={profile} />} />
          <Route path="/new" element={
            <Workspace
              invoice={invoice}
              setInvoice={setInvoice}
              profile={profile}
              refreshProfile={refreshProfile}
              showToast={showToast}
              onUpgrade={setSelectedPlan}
            />
          } />
          <Route path="/history" element={<History />} />
          <Route path="/payment/success" element={
            <PaymentSuccess onDone={() => { refreshProfile(); navigate('/'); }} />
          } />
          <Route path="/payment/cancel" element={
            <PaymentCancel onDone={() => navigate('/')} />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>

    {selectedPlan && (
      <PaymentModal
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
      />
    )}

    {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
  </div>
);
}
function Workspace({ invoice, setInvoice, profile, refreshProfile, showToast, onUpgrade }) {
  const canGenerate = profile && profile.invoices_generated < profile.invoices_limit;
  const [saving, setSaving] = useState(false);
    // 🎯 Validation : La facture doit avoir ces champs minimum pour être enregistrée
  const hasCompany = invoice.company?.name?.trim();
  const hasClient = invoice.client?.name?.trim();
  const hasValidItem = invoice.items?.some(
    (item) => item.description?.trim() && (item.unitPrice || 0) > 0
  );
  const isInvoiceComplete = hasCompany && hasClient && hasValidItem;
  const{t} = useLang();
  // Live total of the current invoice
  const subtotal = invoice.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
  const discountAmount = subtotal * ((invoice.discount || 0) / 100);
  const total = subtotal + taxAmount - discountAmount;

  const quotaPercent = profile
    ? Math.min((profile.invoices_generated / profile.invoices_limit) * 100, 100)
    : 0;

  const handleSave = async () => {
    if (!canGenerate) {
    showToast(t('toast.quotaError'), 'error');
    return;
    }
    setSaving(true);
    try {
      const { error } = await apiFetch('/api/invoices', {
        method: 'POST',
        body: {
          invoice_number: invoice.number,
          client_name: invoice.client.name,
          client_address: invoice.client.address,
          client_email: invoice.client.email,
          client_phone: invoice.client.phone,
          issue_date: invoice.date,
          due_date: invoice.dueDate,
          items: invoice.items,
          tax_rate: invoice.taxRate,
          discount: invoice.discount,
          subtotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total,
          notes: invoice.notes,
        },
      });

      if (error) throw new Error(error.message);

      showToast(t('toast.invoiceSaved'), 'success');
      await refreshProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };


  return (
  <main className="mi-workspace">
    <div className="mi-page-head">
      <h1 className="mi-page-title">{t('form.title')}</h1>
      <p className="mi-page-sub">{t('form.subtitle')}</p>
    </div>

    <div className="mi-grid">
      <div className="mi-col mi-col--form">
        <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
      </div>

      <div className="mi-col mi-col--preview">
        <div className="mi-dark-card">
          <div className="mi-dark-card-head">
            <span className="mi-dark-label">Total de la facture</span>
            <span className="mi-dark-icon">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="mi-dark-value">
            {formatMoney(total, invoice.currency || 'XOF')}
          </div>
          <div className="mi-dark-sub">Mis à jour en direct</div>
        </div>

        <div className="mi-dark-card">
          <div className="mi-dark-card-head">
            <span className="mi-dark-label">Quota ce mois</span>
            <span className="mi-dark-icon">
              <BarChart3 size={16} />
            </span>
          </div>
          <div className="mi-dark-value mi-dark-value--big">
            {profile?.invoices_generated ?? 0}
            <span className="mi-dark-total">/{profile?.invoices_limit ?? 10}</span>
          </div>
          <div className="mi-quota-track">
            <div className="mi-quota-track-fill" style={{ width: `${quotaPercent}%` }} />
          </div>
        </div>

        <InvoicePreview invoice={invoice} />
      </div>
    </div>

    <div className="mi-action-bar">
        {!isInvoiceComplete && (
          <div style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '8px', fontStyle: 'italic' }}>
            Remplissez le nom de l'entreprise, le client et ajoutez un article pour pouvoir enregistrer.
          </div>
        )}
        <button
          className="btn btn-generate"
          onClick={handleSave}
          disabled={saving || !canGenerate || !isInvoiceComplete}
          title={!isInvoiceComplete ? "Complétez les informations (Entreprise, Client, Article) pour enregistrer" : ""}
        >
        {saving ? (
          <>
            <span className="spinner-mini" />
            Enregistrement...
          </>
        ) : canGenerate ? (
          <>
            <FileCheck2 size={18} strokeWidth={2.4} />
            Enregistrer la facture
          </>
        ) : (
          <>
            <Lock size={16} strokeWidth={2.4} />
            Quota atteint
          </>
        )}
      </button>

      {!canGenerate && (
        <button
          className="btn btn-upgrade"
          onClick={() => {
            document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <ArrowUpRight size={16} strokeWidth={2.5} />
          Voir les plans
        </button>
      )}
    </div>

    <PricingSection currentPlan={profile?.plan} onSelect={onUpgrade} />
  </main>
);
}

function PaymentSuccess({ onDone }) {
  const { t } = useLang();
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const path = token
        ? `/api/pay/verify?token=${encodeURIComponent(token)}`
        : '/api/pay/verify';

      try {
        const { data, error } = await apiFetch(path, { method: 'GET' });
        console.log('Verify response:', data);

        if (error) {
          setStatus('error');
          return;
        }
        if (data?.status === 'completed') {
          setStatus('success');
          setTimeout(() => onDone(), 2500);
        } else if (data?.status === 'no_pending_payment') {
          // Nothing to verify (e.g. the user lands here without a checkout):
          // still give Saspay a moment via the webhook, then bounce home.
          setStatus('pending');
          setTimeout(() => onDone(), 2500);
        } else {
          setStatus('pending');
        }
      } catch (err) {
        console.error('Verify failed:', err);
        setStatus('error');
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="payment-page">
      <div className="payment-success">
        <div className="checkmark">
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </div>

        {status === 'checking' && (
          <>
            <h3>Vérification du paiement...</h3>
            <p>Merci de patienter quelques secondes.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h3>{t('payment.successTitle')}</h3>
            <p>{t('payment.successDesc')}</p>
          </>
        )}
        {status === 'pending' && (
          <>
            <h3>Paiement en attente</h3>
            <p>Votre paiement est en cours de validation.</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h3>Erreur de vérification</h3>
            <p>Si vous avez été débité, contactez le support.</p>
          </>
        )}
      </div>
    </div>
  );
}
function PaymentCancel({ onDone }) {

  const {t} = useLang();
  return (
    <div className="payment-page">
      <div className="payment-cancel">
        <h3> {t('payment.cancelTitle')} </h3>
        <p>{t('payment.cancelDesc')}</p>
        <button className="btn btn-plan" onClick={onDone}>{t('payment.back')}</button>
      </div>
    </div>
  );
}

export default App;