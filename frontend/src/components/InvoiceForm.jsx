import {
  Building2, MapPin, Mail, Phone, User, Hash, Calendar,
  Package, Percent, StickyNote, Plus, X
} from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';

const formatFCFA = (n) =>
  isNaN(n) ? '0 FCFA' : Number(n).toLocaleString('fr-SN') + ' FCFA';

function Field({ label, icon: Icon, children, full }) {
  return (
    <label className={`field ${full ? 'field-full' : ''}`}>
      <span className="field-label">
        {Icon && <Icon size={12} strokeWidth={2.6} />}
        {label}
      </span>
      {children}
    </label>
  );
}

export default function InvoiceForm({ invoice, setInvoice }) {
  const { t } = useLang();

  const update = (field, value) => setInvoice(p => ({ ...p, [field]: value }));
  const updateCompany = (f, v) => setInvoice(p => ({ ...p, company: { ...p.company, [f]: v } }));
  const updateClient = (f, v) => setInvoice(p => ({ ...p, client: { ...p.client, [f]: v } }));
  const updateItem = (i, f, v) => setInvoice(p => {
    const items = [...p.items];
    items[i] = { ...items[i], [f]: f === 'description' ? v : Number(v) || 0 };
    return { ...p, items };
  });
  const addItem = () => setInvoice(p => ({
    ...p,
    items: [...p.items, { description: '', quantity: 1, unitPrice: 0 }],
  }));
  const removeItem = (i) => invoice.items.length > 1 &&
    setInvoice(p => ({ ...p, items: p.items.filter((_, idx) => idx !== i) }));

  return (
    <section className="invoice-form">
      <div className="invoice-form-header">
        <h2>{t('form.title')}</h2>
        <p>{t('form.subtitle')}</p>
      </div>

      {/* 01 — Company */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">01</span>
          <div>
            <h3>{t('form.yourCompany')}</h3>
            <p>{t('form.yourCompanyDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label={t('form.companyName')} icon={Building2}>
              <input placeholder={t('form.companyNamePlaceholder')}
                value={invoice.company.name}
                onChange={e => updateCompany('name', e.target.value)} />
            </Field>
            <Field label={t('form.address')} icon={MapPin}>
              <input placeholder={t('form.addressPlaceholder')}
                value={invoice.company.address}
                onChange={e => updateCompany('address', e.target.value)} />
            </Field>
            <Field label={t('form.email')} icon={Mail}>
              <input type="email" placeholder={t('form.emailPlaceholder')}
                value={invoice.company.email}
                onChange={e => updateCompany('email', e.target.value)} />
            </Field>
            <Field label={t('form.phone')} icon={Phone}>
              <input placeholder={t('form.phonePlaceholder')}
                value={invoice.company.phone}
                onChange={e => updateCompany('phone', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 02 — Client */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">02</span>
          <div>
            <h3>{t('form.client')}</h3>
            <p>{t('form.clientDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label={t('form.clientName')} icon={User}>
              <input placeholder={t('form.clientNamePlaceholder')}
                value={invoice.client.name}
                onChange={e => updateClient('name', e.target.value)} />
            </Field>
            <Field label={t('form.address')} icon={MapPin}>
              <input placeholder={t('form.clientAddressPlaceholder')}
                value={invoice.client.address}
                onChange={e => updateClient('address', e.target.value)} />
            </Field>
            <Field label={t('form.email')} icon={Mail}>
              <input type="email" placeholder={t('form.clientEmailPlaceholder')}
                value={invoice.client.email}
                onChange={e => updateClient('email', e.target.value)} />
            </Field>
            <Field label={t('form.phone')} icon={Phone}>
              <input placeholder={t('form.phonePlaceholder')}
                value={invoice.client.phone}
                onChange={e => updateClient('phone', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 03 — Invoice details */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">03</span>
          <div>
            <h3>{t('form.invoiceDetails')}</h3>
            <p>{t('form.invoiceDetailsDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-3">
            <Field label={t('form.invoiceNumber')} icon={Hash}>
              <input value={invoice.number}
                onChange={e => update('number', e.target.value)} />
            </Field>
            <Field label={t('form.issueDate')} icon={Calendar}>
              <input type="date" value={invoice.date}
                onChange={e => update('date', e.target.value)} />
            </Field>
            <Field label={t('form.dueDate')} icon={Calendar}>
              <input type="date" value={invoice.dueDate}
                onChange={e => update('dueDate', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 04 — Items */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">04</span>
          <div>
            <h3>{t('form.items')}</h3>
            <p>{t('form.itemsDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="items-list">
            {invoice.items.map((item, i) => (
              <div key={i} className="item-card">
                <div className="item-card-head">
                  <span className="item-card-num">{i + 1}</span>
                  <button className="item-card-remove"
                    onClick={() => removeItem(i)}
                    disabled={invoice.items.length <= 1}>
                    <X size={16} />
                  </button>
                </div>
                <div className="item-card-fields">
                  <Field label={t('form.description')} icon={Package} full>
                    <input placeholder={t('form.descriptionPlaceholder')}
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)} />
                  </Field>
                  <Field label={t('form.quantity')}>
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)} />
                  </Field>
                  <Field label={t('form.unitPrice')}>
                    <input type="number" min="0" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                  </Field>
                </div>
                <div className="item-card-total">
                  <span>{t('form.lineTotal')}</span>
                  <strong>{formatFCFA((item.quantity || 0) * (item.unitPrice || 0))}</strong>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-add-2" onClick={addItem}>
            <Plus size={16} strokeWidth={2.6} />
            {t('form.addItem')}
          </button>
        </div>
      </div>

      {/* 05 — Taxes */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">05</span>
          <div>
            <h3>{t('form.taxes')}</h3>
            <p>{t('form.taxesDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label={t('form.vatRate')} icon={Percent}>
              <input type="number" min="0" max="100" value={invoice.taxRate}
                onChange={e => update('taxRate', Number(e.target.value) || 0)} />
            </Field>
            <Field label={t('form.discountRate')} icon={Percent}>
              <input type="number" min="0" max="100" value={invoice.discount}
                onChange={e => update('discount', Number(e.target.value) || 0)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 06 — Notes */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">06</span>
          <div>
            <h3>{t('form.notes')}</h3>
            <p>{t('form.notesDesc')}</p>
          </div>
        </div>
        <div className="form-card-body">
          <Field label={t('form.notesLabel')} icon={StickyNote} full>
            <textarea rows="3" placeholder={t('form.notesPlaceholder')}
              value={invoice.notes}
              onChange={e => update('notes', e.target.value)} />
          </Field>
        </div>
      </div>
    </section>
  );
}