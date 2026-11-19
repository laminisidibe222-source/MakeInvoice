import { useState } from 'react';
import {
  Building2, MapPin, Mail, Phone, User, Hash, Calendar,
  Package, Percent, StickyNote, Plus, X, Coins, AlertCircle,
} from 'lucide-react';
import { useLang } from '../i18n/LanguageContext';
import { formatMoney, CURRENCY_OPTIONS } from '../utils/currencies';

function Field({ label, icon: Icon, children, full, error, hint }) {
  return (
    <label
      className={`field ${full ? 'field-full' : ''} ${error ? 'has-error' : ''}`}
      data-invalid={error ? 'true' : undefined}
    >
      <span className="field-label">
        {Icon && <Icon size={12} strokeWidth={2.6} />}
        {label}
      </span>
      {children}
      {error && hint && (
        <span className="field-hint" role="alert">
          <AlertCircle size={12} strokeWidth={2.6} />
          {hint}
        </span>
      )}
    </label>
  );
}

/**
 * Free-typing numeric input.
 *
 * The old `type="number"` fields fought the user: the browser drew up/down
 * spinners, clearing the box snapped it back to 0, and "12.5" collapsed to 12
 * on the way in. This keeps the raw text in local state so anything can be
 * typed (empty, "12.", "0,5"), and only hands the parsed number upwards.
 */
function NumberInput({ value, onChange, min = 0, max, placeholder = '0', ariaLabel }) {
  // `draft` holds exactly what the user typed; null means "show the prop value".
  // No syncing effect, so nothing fights the caret while typing.
  const [draft, setDraft] = useState(null);
  const text = draft ?? (value ? String(value) : '');

  const parse = (raw) => {
    let parsed = Number(raw.replace(',', '.'));
    if (!Number.isFinite(parsed)) return 0;
    if (min != null && parsed < min) parsed = min;
    if (max != null && parsed > max) parsed = max;
    return parsed;
  };

  return (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className="number-input"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={text}
      onFocus={(e) => e.target.select()}
      onBlur={() => {
        // empty means zero, and zero is shown as an empty box again
        const next = parse(draft ?? text);
        setDraft(null);
        onChange(next);
      }}
      onChange={(e) => {
        const cleaned = e.target.value.replace(/[^\d.,-]/g, '');
        setDraft(cleaned);
        onChange(parse(cleaned));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
      }}
    />
  );
}

export default function InvoiceForm({ invoice, setInvoice, showErrors = false }) {
  const { t } = useLang();
  const currency = invoice.currency || 'XOF';

  // Only shown after the user tries to save, so the form does not scold anyone
  // for fields they have not reached yet. Each hint clears the moment it is fixed.
  const missingCompanyName = showErrors && !invoice.company.name.trim();
  const missingClientName = showErrors && !invoice.client.name.trim();
  const noValidItem =
    showErrors &&
    !invoice.items.some((i) => i.description.trim() && (i.unitPrice || 0) > 0);

  const update = (field, value) => setInvoice((p) => ({ ...p, [field]: value }));
  const updateCompany = (f, v) =>
    setInvoice((p) => ({ ...p, company: { ...p.company, [f]: v } }));
  const updateClient = (f, v) =>
    setInvoice((p) => ({ ...p, client: { ...p.client, [f]: v } }));
  const updateItem = (i, f, v) =>
    setInvoice((p) => {
      const items = [...p.items];
      items[i] = { ...items[i], [f]: f === 'description' ? v : Number(v) || 0 };
      return { ...p, items };
    });
  const addItem = () =>
    setInvoice((p) => ({
      ...p,
      items: [...p.items, { description: '', quantity: 1, unitPrice: 0 }],
    }));
  const removeItem = (i) =>
    invoice.items.length > 1 &&
    setInvoice((p) => ({
      ...p,
      items: p.items.filter((_, idx) => idx !== i),
    }));

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
            <Field
              label={t('form.companyName')}
              icon={Building2}
              error={missingCompanyName}
              hint={t('form.companyNameRequired')}
            >
              <input
                placeholder={t('form.companyNamePlaceholder')}
                value={invoice.company.name}
                onChange={(e) => updateCompany('name', e.target.value)}
              />
            </Field>
            <Field label={t('form.address')} icon={MapPin}>
              <input
                placeholder={t('form.addressPlaceholder')}
                value={invoice.company.address}
                onChange={(e) => updateCompany('address', e.target.value)}
              />
            </Field>
            <Field label={t('form.email')} icon={Mail}>
              <input
                type="email"
                placeholder={t('form.emailPlaceholder')}
                value={invoice.company.email}
                onChange={(e) => updateCompany('email', e.target.value)}
              />
            </Field>
            <Field label={t('form.phone')} icon={Phone}>
              <input
                type="tel"
                placeholder={t('form.phonePlaceholder')}
                value={invoice.company.phone}
                onChange={(e) => updateCompany('phone', e.target.value)}
              />
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
            <Field
              label={t('form.clientName')}
              icon={User}
              error={missingClientName}
              hint={t('form.clientNameRequired')}
            >
              <input
                placeholder={t('form.clientNamePlaceholder')}
                value={invoice.client.name}
                onChange={(e) => updateClient('name', e.target.value)}
              />
            </Field>
            <Field label={t('form.address')} icon={MapPin}>
              <input
                placeholder={t('form.clientAddressPlaceholder')}
                value={invoice.client.address}
                onChange={(e) => updateClient('address', e.target.value)}
              />
            </Field>
            <Field label={t('form.email')} icon={Mail}>
              <input
                type="email"
                placeholder={t('form.clientEmailPlaceholder')}
                value={invoice.client.email}
                onChange={(e) => updateClient('email', e.target.value)}
              />
            </Field>
            <Field label={t('form.phone')} icon={Phone}>
              <input
                type="tel"
                placeholder={t('form.phonePlaceholder')}
                value={invoice.client.phone}
                onChange={(e) => updateClient('phone', e.target.value)}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* 03 — Invoice details + Currency */}
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
              <input
                value={invoice.number}
                onChange={(e) => update('number', e.target.value)}
              />
            </Field>
            <Field label={t('form.issueDate')} icon={Calendar}>
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => update('date', e.target.value)}
              />
            </Field>
            <Field label={t('form.dueDate')} icon={Calendar}>
              <input
                type="date"
                value={invoice.dueDate}
                onChange={(e) => update('dueDate', e.target.value)}
              />
            </Field>
            <Field label={t('form.currency')} icon={Coins} full>
              <select
                value={currency}
                onChange={(e) => update('currency', e.target.value)}
                className="currency-select"
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
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
                  <button
                    type="button"
                    className="item-card-remove"
                    onClick={() => removeItem(i)}
                    disabled={invoice.items.length <= 1}
                    aria-label={t('form.removeItem') || 'Remove item'}
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="item-card-fields">
                  <Field
                    label={t('form.description')}
                    icon={Package}
                    full
                    error={noValidItem && !item.description.trim()}
                    hint={t('form.itemDescriptionRequired')}
                  >
                    <input
                      placeholder={t('form.descriptionPlaceholder')}
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                    />
                  </Field>
                  <Field label={t('form.quantity')}>
                    <NumberInput
                      min={1}
                      value={item.quantity}
                      onChange={(v) => updateItem(i, 'quantity', v)}
                      placeholder="1"
                      ariaLabel={t('form.quantity')}
                    />
                  </Field>
                  <Field
                    label={`${t('form.unitPrice')} (${currency})`}
                    error={noValidItem && !((item.unitPrice || 0) > 0)}
                    hint={t('form.itemPriceRequired')}
                  >
                    <NumberInput
                      min={0}
                      value={item.unitPrice}
                      onChange={(v) => updateItem(i, 'unitPrice', v)}
                      placeholder="0"
                      ariaLabel={t('form.unitPrice')}
                    />
                  </Field>
                </div>
                <div className="item-card-total">
                  <span>{t('form.lineTotal')}</span>
                  <strong>
                    {formatMoney(
                      (item.quantity || 0) * (item.unitPrice || 0),
                      currency
                    )}
                  </strong>
                </div>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-add-2" onClick={addItem}>
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
              <NumberInput
                min={0}
                max={100}
                value={invoice.taxRate}
                onChange={(v) => update('taxRate', v)}
                ariaLabel={t('form.vatRate')}
              />
            </Field>
            <Field label={t('form.discountRate')} icon={Percent}>
              <NumberInput
                min={0}
                max={100}
                value={invoice.discount}
                onChange={(v) => update('discount', v)}
                ariaLabel={t('form.discountRate')}
              />
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
            <textarea
              rows="3"
              placeholder={t('form.notesPlaceholder')}
              value={invoice.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </Field>
        </div>
      </div>
    </section>
  );
}
