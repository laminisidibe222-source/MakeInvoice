import { useEffect, useState } from 'react';
import { FileText, Search, Calendar } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../i18n/LanguageContext';
import { FileText, Search, Calendar, Download, Loader2 } from 'lucide-react';
import { downloadInvoicePdf } from '../utils/invoicePdf';

export default function History() {
  const { t } = useLang();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

      const handleDownload = async (inv) => {
      setDownloadingId(inv.id);
      try {
        await downloadInvoicePdf({
          ...inv,
          company_name: inv.company_name || 'Votre entreprise',
        });
      } catch (err) {
        console.error('PDF error:', err);
        alert('Impossible de générer le PDF.');
      } finally {
        setDownloadingId(null);
      }
    };

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

  const countLabel =
    filtered.length === 1 ? t('history.count') : t('history.countPlural');

  return (
    <main className="mi-workspace">
      <div className="mi-page-head">
        <h1 className="mi-page-title">{t('history.title')}</h1>
        <p className="mi-page-sub">{t('history.subtitle')}</p>
      </div>

      <div className="mi-panel">
        <div className="mi-panel-head mi-panel-head--search">
          <div className="mi-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={t('history.searchPlaceholder')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <span className="mi-count">
            {filtered.length} {countLabel}
          </span>
        </div>

        {loading ? (
          <div className="mi-empty">{t('history.loading')}</div>
        ) : filtered.length === 0 ? (
          <div className="mi-empty">
            <FileText size={28} />
            <p>{query ? t('history.noResults') : t('history.noInvoices')}</p>
          </div>
        ) : (
          <div className="mi-table mi-table--history">
            <div className="mi-table-head">
              <span>{t('history.tableNum')}</span>
              <span>{t('history.tableClient')}</span>
              <span>{t('history.tableDate')}</span>
              <span className="mi-table-right">{t('history.tableTotal')}</span>
              <span></span>
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
                <span className="mi-table-total">
                  {formatMoney(inv.total, inv.currency)}
                </span>
                <button
                  className="mi-download-btn"
                  onClick={() => handleDownload(inv)}
                  disabled={downloadingId === inv.id}
                  title="Télécharger le PDF"
                >
                  {downloadingId === inv.id ? (
                    <Loader2 size={14} className="spin" />
                  ) : (
                    <Download size={14} />
                  )}
                </button>
          </div>
          ))}
        </div>
        )}
      </div>
    </main>
  );
}