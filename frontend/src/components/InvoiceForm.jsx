import {
  Building2, MapPin, Mail, Phone, User, Hash, Calendar,
  Package, Percent, StickyNote, Plus, X
} from 'lucide-react';

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
        <h2>Nouvelle facture</h2>
        <p>Remplissez les informations ci-dessous — l'aperçu se met à jour en direct.</p>
      </div>

      {/* 01 — Entreprise */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">01</span>
          <div>
            <h3>Votre entreprise</h3>
            <p>Les coordonnées qui apparaîtront en haut de la facture.</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label="Nom de l'entreprise" icon={Building2}>
              <input placeholder="Ex: Lamine Digital SARL"
                value={invoice.company.name}
                onChange={e => updateCompany('name', e.target.value)} />
            </Field>
            <Field label="Adresse" icon={MapPin}>
              <input placeholder="Ex: Dakar, Sénégal"
                value={invoice.company.address}
                onChange={e => updateCompany('address', e.target.value)} />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" placeholder="contact@entreprise.sn"
                value={invoice.company.email}
                onChange={e => updateCompany('email', e.target.value)} />
            </Field>
            <Field label="Téléphone" icon={Phone}>
              <input placeholder="+221 77 000 00 00"
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
            <h3>Client</h3>
            <p>À qui adressez-vous cette facture ?</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label="Nom du client" icon={User}>
              <input placeholder="Ex: Aly Diop"
                value={invoice.client.name}
                onChange={e => updateClient('name', e.target.value)} />
            </Field>
            <Field label="Adresse" icon={MapPin}>
              <input placeholder="Ex: Rue 10, Dakar"
                value={invoice.client.address}
                onChange={e => updateClient('address', e.target.value)} />
            </Field>
            <Field label="Email" icon={Mail}>
              <input type="email" placeholder="client@email.com"
                value={invoice.client.email}
                onChange={e => updateClient('email', e.target.value)} />
            </Field>
            <Field label="Téléphone" icon={Phone}>
              <input placeholder="+221 78 000 00 00"
                value={invoice.client.phone}
                onChange={e => updateClient('phone', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 03 — Détails facture */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">03</span>
          <div>
            <h3>Détails de la facture</h3>
            <p>Numéro, date d'émission et échéance de paiement.</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-3">
            <Field label="N° de facture" icon={Hash}>
              <input value={invoice.number}
                onChange={e => update('number', e.target.value)} />
            </Field>
            <Field label="Date d'émission" icon={Calendar}>
              <input type="date" value={invoice.date}
                onChange={e => update('date', e.target.value)} />
            </Field>
            <Field label="Date d'échéance" icon={Calendar}>
              <input type="date" value={invoice.dueDate}
                onChange={e => update('dueDate', e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* 04 — Articles */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">04</span>
          <div>
            <h3>Articles</h3>
            <p>Ce que vous facturez à votre client.</p>
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
                    disabled={invoice.items.length <= 1}
                    title="Supprimer">
                    <X size={16} />
                  </button>
                </div>
                <div className="item-card-fields">
                  <Field label="Description" icon={Package} full>
                    <input placeholder="Ex: Prestation de service"
                      value={item.description}
                      onChange={e => updateItem(i, 'description', e.target.value)} />
                  </Field>
                  <Field label="Quantité">
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => updateItem(i, 'quantity', e.target.value)} />
                  </Field>
                  <Field label="Prix unitaire (FCFA)">
                    <input type="number" min="0" value={item.unitPrice}
                      onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                  </Field>
                </div>
                <div className="item-card-total">
                  <span>Total ligne</span>
                  <strong>{formatFCFA((item.quantity || 0) * (item.unitPrice || 0))}</strong>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-add-2" onClick={addItem}>
            <Plus size={16} strokeWidth={2.6} />
            Ajouter un article
          </button>
        </div>
      </div>

      {/* 05 — Taxes */}
      <div className="form-card">
        <div className="form-card-head">
          <span className="form-card-num">05</span>
          <div>
            <h3>Taxes & remises</h3>
            <p>Ajustez la TVA et les éventuelles remises.</p>
          </div>
        </div>
        <div className="form-card-body">
          <div className="form-grid-2">
            <Field label="TVA (%)" icon={Percent}>
              <input type="number" min="0" max="100" value={invoice.taxRate}
                onChange={e => update('taxRate', Number(e.target.value) || 0)} />
            </Field>
            <Field label="Remise (%)" icon={Percent}>
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
            <h3>Notes</h3>
            <p>Message qui apparaîtra en bas de la facture.</p>
          </div>
        </div>
        <div className="form-card-body">
          <Field label="Notes additionnelles" icon={StickyNote} full>
            <textarea rows="3" placeholder="Ex: Merci pour votre confiance."
              value={invoice.notes}
              onChange={e => update('notes', e.target.value)} />
          </Field>
        </div>
      </div>
    </section>
  );
}