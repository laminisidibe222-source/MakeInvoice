import { formatMoney } from './currencies';

/**
 * Génère et télécharge un PDF pour une facture donnée.
 * @param {Object} invoice — facture avec company, client, items, etc.
 */
export async function downloadInvoicePdf(invoice) {
  const html2pdf = (await import('html2pdf.js')).default;
  const currency = invoice.currency || 'XOF';

  // Calculs
  const subtotal = (invoice.items || []).reduce(
    (s, i) => s + (i.quantity || 0) * (i.unitPrice || 0),
    0
  );
  const taxAmount = subtotal * ((invoice.tax_rate || 0) / 100);
  const discountAmount = subtotal * ((invoice.discount || 0) / 100);
  const total = subtotal + taxAmount - discountAmount;

  // Construction du HTML de la facture
  const html = `
    <div style="font-family: 'Inter', -apple-system, sans-serif; background: white; padding: 40px; color: #0F172A;">
      <div style="height: 6px; background: linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899); border-radius: 3px; margin-bottom: 32px;"></div>

      <div style="display: flex; justify-content: space-between; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px dashed #EAECF5;">
        <div>
          <h1 style="font-size: 22px; font-weight: 800; color: #0F172A; margin: 0 0 8px 0;">${escapeHtml(invoice.company_name || 'Votre entreprise')}</h1>
          ${invoice.company_address ? `<p style="font-size: 13px; color: #94A3B8; margin: 2px 0;">${escapeHtml(invoice.company_address)}</p>` : ''}
          ${invoice.company_email ? `<p style="font-size: 13px; color: #94A3B8; margin: 2px 0;">${escapeHtml(invoice.company_email)}</p>` : ''}
          ${invoice.company_phone ? `<p style="font-size: 13px; color: #94A3B8; margin: 2px 0;">${escapeHtml(invoice.company_phone)}</p>` : ''}
        </div>
        <div style="text-align: right;">
          <h2 style="font-size: 32px; font-weight: 900; background: linear-gradient(135deg, #6366F1, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0 0 8px 0;">FACTURE</h2>
          <p style="font-size: 12px; color: #475569; margin: 2px 0;"><strong style="color: #94A3B8;">N° </strong>${escapeHtml(invoice.invoice_number || '')}</p>
          <p style="font-size: 12px; color: #475569; margin: 2px 0;"><strong style="color: #94A3B8;">Date </strong>${escapeHtml(invoice.issue_date || '')}</p>
          <p style="font-size: 12px; color: #475569; margin: 2px 0;"><strong style="color: #94A3B8;">Échéance </strong>${escapeHtml(invoice.due_date || '')}</p>
        </div>
      </div>

      <div style="margin-bottom: 32px; padding: 18px 20px; background: linear-gradient(135deg, #F8F9FE, #EEF2FF); border-radius: 10px; border-left: 4px solid #6366F1;">
        <h3 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #6366F1; margin: 0 0 8px 0;">FACTURÉ À</h3>
        <p style="font-size: 14px; color: #0F172A; margin: 4px 0;"><strong>${escapeHtml(invoice.client_name || '—')}</strong></p>
        ${invoice.client_address ? `<p style="font-size: 13px; color: #475569; margin: 2px 0;">${escapeHtml(invoice.client_address)}</p>` : ''}
        ${invoice.client_email ? `<p style="font-size: 13px; color: #475569; margin: 2px 0;">${escapeHtml(invoice.client_email)}</p>` : ''}
        ${invoice.client_phone ? `<p style="font-size: 13px; color: #475569; margin: 2px 0;">${escapeHtml(invoice.client_phone)}</p>` : ''}
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94A3B8; border-bottom: 2px solid #EAECF5;">Description</th>
            <th style="text-align: left; padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94A3B8; border-bottom: 2px solid #EAECF5;">Qté</th>
            <th style="text-align: left; padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94A3B8; border-bottom: 2px solid #EAECF5;">Prix unitaire</th>
            <th style="text-align: right; padding: 12px 10px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #94A3B8; border-bottom: 2px solid #EAECF5;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || [])
            .map(
              (item) => `
            <tr>
              <td style="padding: 14px 10px; font-size: 13.5px; border-bottom: 1px solid #EAECF5; color: #0F172A;">${escapeHtml(item.description || '—')}</td>
              <td style="padding: 14px 10px; font-size: 13.5px; border-bottom: 1px solid #EAECF5; color: #0F172A;">${item.quantity}</td>
              <td style="padding: 14px 10px; font-size: 13.5px; border-bottom: 1px solid #EAECF5; color: #0F172A;">${formatMoney(item.unitPrice, currency)}</td>
              <td style="padding: 14px 10px; font-size: 13.5px; border-bottom: 1px solid #EAECF5; color: #0F172A; text-align: right;">${formatMoney((item.quantity || 0) * (item.unitPrice || 0), currency)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div style="margin-left: auto; width: 300px; margin-bottom: 28px; padding: 20px 22px; background: #F8F9FE; border-radius: 10px;">
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13.5px; color: #475569;">
          <span>Sous-total</span>
          <span style="font-weight: 600; color: #0F172A;">${formatMoney(subtotal, currency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13.5px; color: #475569;">
          <span>TVA (${invoice.tax_rate || 0}%)</span>
          <span style="font-weight: 600; color: #0F172A;">${formatMoney(taxAmount, currency)}</span>
        </div>
        ${
          invoice.discount > 0
            ? `
          <div style="display: flex; justify-content: space-between; padding: 6px 0; font-size: 13.5px; color: #EF4444;">
            <span>Remise (${invoice.discount}%)</span>
            <span style="font-weight: 600;">-${formatMoney(discountAmount, currency)}</span>
          </div>
        `
            : ''
        }
        <div style="display: flex; justify-content: space-between; border-top: 2px solid #0F172A; margin-top: 10px; padding-top: 14px; font-size: 20px; font-weight: 900;">
          <span>Total</span>
          <span style="background: linear-gradient(135deg, #6366F1, #EC4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${formatMoney(total, currency)}</span>
        </div>
      </div>

      ${
        invoice.notes
          ? `
        <div style="padding: 16px 20px; background: #FFFBEB; border-radius: 10px; border-left: 4px solid #F59E0B; margin-bottom: 24px;">
          <h4 style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.2px; color: #B45309; margin: 0 0 6px 0;">NOTES</h4>
          <p style="font-size: 13px; color: #78350F; margin: 0;">${escapeHtml(invoice.notes)}</p>
        </div>
      `
          : ''
      }

      <div style="text-align: center; padding-top: 20px; border-top: 1px dashed #EAECF5;">
        <p style="font-size: 13px; color: #475569; margin: 0;">Merci pour votre confiance !</p>
        <p style="font-size: 11px; color: #94A3B8; margin: 6px 0 0 0;">Généré avec MakeInvoice</p>
      </div>
    </div>
  `;

  // Créer un élément temporaire pour la conversion
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px';
  container.innerHTML = html;
  document.body.appendChild(container);

  try {
    await html2pdf()
      .set({
        margin: 0,
        filename: `facture-${invoice.invoice_number || 'brouillon'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(container.firstElementChild)
      .save();
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}