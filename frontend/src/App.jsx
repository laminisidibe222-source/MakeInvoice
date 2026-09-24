import { FileCheck2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './Supabase';
import Auth from './components/Auth';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import PricingSection from './components/PricingSection';
import PaymentModal from './components/PaymentModal';
import { Zap, LogOut, Save, Sparkles, CheckCircle2, XCircle, Printer } from 'lucide-react';
import Logo from './components/Logo';
import LandingPage from './components/LandingPage';
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
  // ... your existing logout code ...
  setSession(null);
  setProfile(null);
  setInvoice(DEFAULT_INVOICE);
  setShowAuth(false); // Add this line to show the landing page again
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
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🧾</span>
            <span className="logo-text">MakeInvoice</span>
          </div>
          {profile && (
            <span className={`plan-badge plan-${profile.plan}`}>
              {profile.plan}
            </span>
          )}
        </div>
        <div className="header-right">
          {profile && (
            <div className="quota">
              <span className="quota-text">
                {profile.invoices_generated} / {profile.invoices_limit} factures
              </span>
              <div className="quota-bar">
                <div
                  className="quota-fill"
                  style={{ width: `${Math.min((profile.invoices_generated / profile.invoices_limit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          <button className="btn btn-logout" onClick={handleLogout}>
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </header>

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

  const handleSave = async () => {
    if (!canGenerate) {
      showToast('Quota atteint. Passez à un plan supérieur.', 'error');
      return;
    }
    setSaving(true);
    try {
      const subtotal = invoice.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
      const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
      const discountAmount = subtotal * ((invoice.discount || 0) / 100);
      const total = subtotal + taxAmount - discountAmount;

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

  return (
    <>
      <main className="workspace">
        <InvoiceForm invoice={invoice} setInvoice={setInvoice} />
        <InvoicePreview invoice={invoice} />
      </main>

      <div className="action-bar">
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
    </>
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