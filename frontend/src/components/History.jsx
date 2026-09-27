import { useEffect, useState } from 'react';
import { FileText, Search, Calendar, Download } from 'lucide-react';
import { supabase } from '../supabase';

export default function History() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      setInvoices(data || []);
      setLoading(false);
    })();
  }, []);

  const formatFCFA = (n) =>
    isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

  const filtered = invoices.filter((inv) => {
    const q = query.toLowerCase();
    return (
      (inv.invoice_number || '').toLowerCase().includes(q) ||
      (inv.client_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="mi-workspace">
      <div className="mi-page-head">
        <h1 className="mi-page-title">Historique</h1>
        <p className="mi-page-sub">
          Toutes vos factures, en un seul endroit.
        </p>
      </div>

      <div className="mi-panel">
        <div className="mi-panel-head mi-panel-head--search">
          <div className="mi-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Rechercher par n° ou client..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="mi-count">
            {filtered.length} facture{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loading ? (
          <div className="mi-empty">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="mi-empty">
            <FileText size={28} />
            <p>{query ? 'Aucun résultat.' : 'Aucune facture pour le moment.'}</p>
          </div>
        ) : (
          <div className="mi-table">
            <div className="mi-table-head">
              <span>N° Facture</span>
              <span>Client</span>
              <span>Date</span>
              <span className="mi-table-right">Total</span>
            </div>
            {filtered.map((inv) => (
              <div className="mi-table-row" key={inv.id}>
                <span className="mi-table-num">
                  <FileText size={14} /> {inv.invoice_number}
                </span>
                <span className="mi-table-client">{inv.client_name || '—'}</span>
                <span className="mi-table-date">
                  <Calendar size={13} /> {inv.issue_date || '—'}
                </span>
                <span className="mi-table-total">{formatFCFA(inv.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}