import { useState } from 'react';
import { Printer, Download, Loader2 } from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { formatMoney } from '../utils/currencies';
const formatFCFA = (n) =>
  isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

export default function InvoicePreview({ invoice }) {
  const { t } = useLang();
  const [downloading, setDownloading] = useState(false);

  const subtotal = invoice.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
  const discountAmount = subtotal * ((invoice.discount || 0) / 100);
  const total = subtotal + taxAmount - discountAmount;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const element = document.getElementById('invoice-paper');
      if (!element) throw new Error('Preview not found');
      await html2pdf()
        .set({
          margin: 0,
          filename: `invoice-${invoice.number || 'draft'}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error('PDF error:', err);
      alert('Unable to generate PDF. Try printing instead.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <section className="preview-section fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="preview-header">
        <h2>{t('preview.livePreview')}</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-print" onClick={() => window.print()}>
            <Printer size={15} /> {t('preview.print')}
          </button>
          <button className="btn btn-download" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <>
                <Loader2 size={15} className="spin" /> {t('preview.generating')}
              </>
            ) : (
              <>
                <Download size={15} /> {t('preview.download')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="invoice-paper" id="invoice-paper">
        <div className="invoice-body">
          <div className="invoice-top">
            <div className="invoice-company">
              <h1>{invoice.company.name || '—'}</h1>
              {invoice.company.address && <p>{invoice.company.address}</p>}
              {invoice.company.email && <p>{invoice.company.email}</p>}
              {invoice.company.phone && <p>{invoice.company.phone}</p>}
            </div>
            <div className="invoice-meta">
              <h2>{t('preview.invoice')}</h2>
              <p><strong>N° </strong>{invoice.number}</p>
              <p><strong>Date </strong>{invoice.date}</p>
              <p><strong>{t('form.dueDate')} </strong>{invoice.dueDate}</p>
            </div>
          </div>

          <div className="invoice-client">
            <h3>{t('preview.billedTo')}</h3>
            <p><strong>{invoice.client.name || '—'}</strong></p>
            {invoice.client.address && <p>{invoice.client.address}</p>}
            {invoice.client.email && <p>{invoice.client.email}</p>}
            {invoice.client.phone && <p>{invoice.client.phone}</p>}
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>{t('preview.description')}</th>
                <th>{t('preview.qty')}</th>
                <th>{t('preview.unitPrice')}</th>
                <th>{t('preview.total')}</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, i) => (
                <tr key={i}>
                  <td>{item.description || '—'}</td>
                  <td>{item.quantity}</td>
                  <td>{formatFCFA(item.unitPrice)}</td>
                  <td>{formatFCFA((item.quantity || 0) * (item.unitPrice || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="invoice-totals">
            <div className="totals-row">
              <span>{t('preview.subtotal')}</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>{t('preview.vat')} ({invoice.taxRate}%)</span>
              <span>{formatFCFA(taxAmount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="totals-row discount">
                <span>{t('preview.discount')} ({invoice.discount}%)</span>
                <span>-{formatFCFA(discountAmount)}</span>
              </div>
            )}
            <div className="totals-row grand-total">
              <span>{t('preview.grandTotal')}</span>
              <span>{formatFCFA(total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="invoice-notes">
              <h4>{t('preview.notes')}</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          <div className="invoice-footer">
            <p>{t('preview.thankYou')}</p>
            <p className="invoice-footer-small">{t('preview.generatedWith')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}