import { useEffect, useState } from 'react';
import { Check, Loader2, Phone, Clock } from 'lucide-react';
import { apiFetch } from '../supabase';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = async () => {
    try {
      const data = await apiFetch('/api/payments/manual/pending');
      setPayments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    setProcessing(id);
    try {
      await apiFetch(`/api/payments/manual/${id}/approve`, { method: 'POST' });
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="mi-empty">Chargement...</div>;

  return (
    <main className="mi-workspace">
      <div className="mi-page-head">
        <h1 className="mi-page-title">💳 Paiements en attente</h1>
        <p className="mi-page-sub">Validez les paiements reçus par Wave ou Mixx by Yas</p>
      </div>

      {payments.length === 0 ? (
        <div className="mi-panel">
          <div className="mi-empty">
            <Clock size={28} />
            <p>Aucun paiement en attente</p>
          </div>
        </div>
      ) : (
        <div className="mi-panel">
          {payments.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid #EAECF0' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>{p.profiles?.email}</strong>
                <span style={{ fontSize: '13px', color: '#64748B' }}>Plan {p.plan} · {p.amount.toLocaleString('fr-SN')} FCFA</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475467' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {p.method === 'wave' ? '🌊' : '🔵'} {p.method}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Phone size={12} /> {p.sender_phone}</span>
              </div>
              <button
                className="btn btn-generate"
                onClick={() => approve(p.id)}
                disabled={processing === p.id}
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                {processing === p.id ? <Loader2 size={14} className="spin" /> : <Check size={14} />}
                Approuver
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}