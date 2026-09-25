import { FileCheck2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabase';
import Auth from './components/Auth';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import PricingSection from './components/PricingSection';
import PaymentModal from './components/PaymentModal';
import { Zap, LogOut, Save, Sparkles, CheckCircle2, XCircle, Printer } from 'lucide-react';
import Logo from './components/Logo';
import LandingPage from './components/LandingPage';
import Sidebar from './components/Sidebar';
import { BarChart3, TrendingUp } from 'lucide-react';
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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [invoice, setInvoice] = useState(DEFAULT_INVOICE);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [toast, setToast] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate();

  // Auth state
  useEffect(() => {
  let mounted = true;

  // 1. Get the initial session from storage
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!mounted) return;
    setSession(session);
    setLoading(false);
  });

  // 2. Listen for auth changes (login, logout, token refresh)
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (!mounted) return;
      setSession(session);

      // Only reset to landing if the user explicitly signed out
      if (event === 'SIGNED_OUT') {
        setShowAuth(false);
      }
    }
  );

  return () => {
    mounted = false;
    subscription.unsubscribe();
  };
}, []);

  // Load profile when session exists
  useEffect(() => {
    if (session) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [session]);

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (!error) {
      setProfile(data);
      // Prefill company info
      setInvoice(prev => ({
        ...prev,
        company: {
          name: data.company_name || '',
          address: data.company_address || '',
          email: data.email || '',
          phone: data.company_phone || '',
        },
      }));
    }
  };


  const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Logout error:', err);
  } finally {
    // Clear all local state
    setSession(null);
    setProfile(null);
    setInvoice(DEFAULT_INVOICE);
    setShowAuth(false);   // ← THIS LINE is the fix
  }
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
  return <Auth onAuth={setSession} />;
}

 return (
  <div className="mi-app-shell">
    <Sidebar onLogout={handleLogout} />

    <div className="mi-app-main">
      {/* Top bar */}
      <header className="mi-topbar">
        <div className="mi-topbar-left">
          <div className="mi-status-pill">
            <span className="mi-status-dot" />
            <span>Mode Sénégal · TVA 18%</span>
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
              <span className="mi-quota-label">factures</span>
            </div>
          )}
          <button className="mi-icon-btn" type="button" aria-label="Mode sombre">
            🌙
          </button>
        </div>
      </header>

      <div className="mi-content">
        <Routes>
          <Route path="/" element={
            <Workspace
              invoice={invoice}
              setInvoice={setInvoice}
              profile={profile}
              loadProfile={loadProfile}
              showToast={showToast}
              onUpgrade={setSelectedPlan}
            />
          } />
          <Route path="/payment/success" element={
            <PaymentSuccess onDone={() => { loadProfile(); navigate('/'); }} />
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
        onSuccess={() => { setSelectedPlan(null); loadProfile(); }}
        showToast={showToast}
      />
    )}

    {toast && (
      <div className={`toast toast-${toast.type}`}>{toast.message}</div>
    )}
  </div>
);
}
function Workspace({ invoice, setInvoice, profile, loadProfile, showToast, onUpgrade }) {
  const canGenerate = profile && profile.invoices_generated < profile.invoices_limit;
  const [saving, setSaving] = useState(false);

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
      showToast('Quota atteint. Passez à un plan supérieur.', 'error');
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/invoices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
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
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      showToast('Facture enregistrée !', 'success');
      await loadProfile();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const formatFCFA = (n) =>
    isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

  return (
    <main className="mi-workspace">
      {/* Title row */}
      <div className="mi-page-head">
        <h1 className="mi-page-title">Nouvelle facture</h1>
        <p className="mi-page-sub">
          Remplissez les informations ci-dessous — l'aperçu se met à jour en direct.
        </p>
      </div>

      <div className="mi-grid">
        {/* LEFT — form */}
        <div className="mi-col mi-col--form">
          <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
        </div>

        {/* RIGHT — stats + preview */}
        <div className="mi-col mi-col--preview">
          {/* Dark card: total */}
          <div className="mi-dark-card">
            <div className="mi-dark-card-head">
              <span className="mi-dark-label">Total de la facture</span>
              <span className="mi-dark-icon">
                <TrendingUp size={16} />
              </span>
            </div>
            <div className="mi-dark-value">{formatFCFA(total)}</div>
            <div className="mi-dark-sub">Mis à jour en direct</div>
          </div>

          {/* Dark card: quota */}
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
              <div
                className="mi-quota-track-fill"
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
          </div>

          {/* White preview */}
          <InvoicePreview invoice={invoice} />
        </div>
      </div>

      {/* Action bar */}
      <div className="mi-action-bar">
        <button
          className="btn btn-generate"
          onClick={handleSave}
          disabled={saving || !canGenerate}
        >
          {saving ? (
            <>
              <span className="spinner-mini" />
              Enregistrement...
            </>
          ) : (
            <>
              <FileCheck2 size={18} strokeWidth={2.4} />
              {canGenerate ? 'Enregistrer la facture' : 'Quota atteint'}
            </>
          )}
        </button>

        {!canGenerate && (
          <button className="btn btn-upgrade" onClick={() => onUpgrade('pro')}>
            <Sparkles size={16} />
            Passer à un plan supérieur
          </button>
        )}
      </div>

      <PricingSection currentPlan={profile?.plan} onSelect={onUpgrade} />
    </main>
  );
}

function PaymentSuccess({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="payment-page">
      <div className="payment-success">
        <div className="checkmark">
          <CheckCircle2 size={44} strokeWidth={2.5} />
        </div>
        <h3>Paiement réussi !</h3>
        <p>Votre plan a été activé. Redirection en cours...</p>
      </div>
    </div>
  );
}

function PaymentCancel({ onDone }) {
  return (
    <div className="payment-page">
      <div className="payment-cancel">
        <h3>Paiement annulé</h3>
        <p>Vous n'avez pas été débité.</p>
        <button className="btn btn-plan" onClick={onDone}>Retour</button>
      </div>
    </div>
  );
}

export default App;