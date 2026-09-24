import { Printer } from 'lucide-react';
const formatFCFA = (n) =>
  isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

export default function InvoicePreview({ invoice }) {
  const subtotal = invoice.items.reduce((s, i) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const taxAmount = subtotal * ((invoice.taxRate || 0) / 100);
  const discountAmount = subtotal * ((invoice.discount || 0) / 100);
  const total = subtotal + taxAmount - discountAmount;

  return (
    <section className="preview-section fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="preview-header">
        <h2>✨ Aperçu en direct</h2>
        <button className="btn btn-print" onClick={() => window.print()}>
          <Printer size={15} /> Imprimer / PDF
        </button>
      </div>

      <div className="invoice-paper" id="invoice-paper">
        <div className="invoice-body">
          <div className="invoice-top">
            <div className="invoice-company">
              <h1>{invoice.company.name || 'Votre entreprise'}</h1>
              {invoice.company.address && <p>{invoice.company.address}</p>}
              {invoice.company.email && <p>{invoice.company.email}</p>}
              {invoice.company.phone && <p>{invoice.company.phone}</p>}
            </div>
            <div className="invoice-meta">
              <h2>FACTURE</h2>
              <p><strong>N° </strong>{invoice.number}</p>
              <p><strong>Date </strong>{invoice.date}</p>
              <p><strong>Échéance </strong>{invoice.dueDate}</p>
            </div>
          </div>

          <div className="invoice-client">
            <h3>Facturé à</h3>
            <p><strong>{invoice.client.name || '—'}</strong></p>
            {invoice.client.address && <p>{invoice.client.address}</p>}
            {invoice.client.email && <p>{invoice.client.email}</p>}
            {invoice.client.phone && <p>{invoice.client.phone}</p>}
          </div>

          <table className="invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qté</th>
                <th>Prix unitaire</th>
                <th>Total</th>
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
              <span>Sous-total</span>
              <span>{formatFCFA(subtotal)}</span>
            </div>
            <div className="totals-row">
              <span>TVA ({invoice.taxRate}%)</span>
              <span>{formatFCFA(taxAmount)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="totals-row discount">
                <span>Remise ({invoice.discount}%)</span>
                <span>-{formatFCFA(discountAmount)}</span>
              </div>
            )}
            <div className="totals-row grand-total">
              <span>Total</span>
              <span>{formatFCFA(total)}</span>
            </div>
          </div>

          {invoice.notes && (
            <div className="invoice-notes">
              <h4>Notes</h4>
              <p>{invoice.notes}</p>
            </div>
          )}

          <div className="invoice-footer">
            <p>Merci pour votre confiance !</p>
            <p className="invoice-footer-small">Généré avec MakeInvoice</p>
          </div>
        </div>
      </div>
    </section>
  );
}