import {
  FileText, PlusCircle, History, Users, Palette, Settings, HelpCircle, LogOut,
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ onLogout }) {
  const items = [
    { icon: FileText, label: 'Factures', active: true },
    { icon: PlusCircle, label: 'Nouvelle facture' },
    { icon: History, label: 'Historique' },
    { icon: Users, label: 'Clients' },
    { icon: Palette, label: 'Modèles' },
    { icon: Settings, label: 'Paramètres' },
  ];

  return (
    <aside className="mi-sidebar">
      <div className="mi-sidebar-logo">
        <Logo size={26} />
      </div>

      <nav className="mi-sidebar-nav">
        {items.map((it, i) => {
          const Icon = it.icon;
          return (
            <button
              key={i}
              type="button"
              className={`mi-nav-item ${it.active ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{it.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mi-sidebar-footer">
        <button type="button" className="mi-nav-item">
          <HelpCircle size={18} strokeWidth={2} />
          <span>Support</span>
        </button>
        <button
          type="button"
          className="mi-nav-item mi-nav-item--logout"
          onClick={onLogout}
        >
          <LogOut size={18} strokeWidth={2} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}