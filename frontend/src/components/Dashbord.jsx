import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, ArrowRight, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../supabase';
import { useLang } from '../i18n/LanguageContext';

export default function Dashboard({ profile }) {
  const { t } = useLang();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, client_name, total, issue_date, created_at')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      setInvoices(data || []);
      setLoading(false);
    })();
  }, []);

  const totalBilled = invoices.reduce((s, i) => s + (Number(i.total) || 0), 0);
  const formatFCFA = (n) =>
    isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

  const quotaPercent = profile
    ? Math.min((profile.invoices_generated / profile.invoices_limit) * 100, 100)
    : 0;

  return (
    <main className="mi-workspace">
      <div className="mi-page-head">
        <h1 className="mi-page-title">{t('dashboard.hello')}</h1>
        <p className="mi-page-sub">{t('dashboard.subtitle')}</p>
      </div>

      <div className="mi-stats-grid">
        <div className="mi-dark-card">
          <div className="mi-dark-card-head">
            <span className="mi-dark-label">{t('dashboard.invoicesThisMonth')}</span>
            <span className="mi-dark-icon"><FileText size={16} /></span>
          </div>
          <div className="mi-dark-value mi-dark-value--big">
            {profile?.invoices_generated ?? 0}
            <span className="mi-dark-total">/{profile?.invoices_limit ?? 10}</span>
          </div>
          <div className="mi-quota-track">
            <div className="mi-quota-track-fill" style={{ width: `${quotaPercent}%` }} />
          </div>
        </div>

        <div className="mi-dark-card">
          <div className="mi-dark-card-head">
            <span className="mi-dark-label">{t('dashboard.totalBilled')}</span>
            <span className="mi-dark-icon"><TrendingUp size={16} /></span>
          </div>
          <div className="mi-dark-value">{formatFCFA(totalBilled)}</div>
          <div className="mi-dark-sub">{t('dashboard.lastFive')}</div>
        </div>

        <Link to="/new" className="mi-cta-card">
          <div className="mi-cta-icon"><Plus size={22} strokeWidth={2.5} /></div>
          <div>
            <div className="mi-cta-title">{t('dashboard.newInvoice')}</div>
            <div className="mi-cta-sub">{t('dashboard.newInvoiceDesc')}</div>
          </div>
          <ArrowRight size={18} className="mi-cta-arrow" />
        </Link>
      </div>

      <div className="mi-panel">
        <div className="mi-panel-head">
          <h2>{t('dashboard.recentInvoices')}</h2>
          <Link to="/history" className="mi-panel-link">
            {t('dashboard.viewAll')} <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="mi-empty">{t('dashboard.loading')}</div>
        ) : invoices.length === 0 ? (
          <div className="mi-empty">
            <FileText size={28} />
            <p>{t('dashboard.noInvoices')}</p>
            <Link to="/new" className="btn btn-generate" style={{ marginTop: 12 }}>
              <Plus size={16} /> {t('dashboard.createFirst')}
            </Link>
          </div>
        ) : (
          <div className="mi-invoice-list">
            {invoices.map((inv) => (
              <div className="mi-invoice-row" key={inv.id}>
                <div className="mi-invoice-row-icon">
                  <FileText size={18} />
                </div>
                <div className="mi-invoice-row-main">
                  <div className="mi-invoice-row-num">{inv.invoice_number}</div>
                  <div className="mi-invoice-row-client">{inv.client_name || '—'}</div>
                </div>
                <div className="mi-invoice-row-date">
                  <Calendar size={13} />
                  {inv.issue_date || '—'}
                </div>
                <div className="mi-invoice-row-total">{formatFCFA(inv.total)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}