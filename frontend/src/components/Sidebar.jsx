import { FileText, PlusCircle, History, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useLang } from '../i18n/LanguageContext';

export default function Sidebar({ onLogout, isOpen, onClose }) {
  const { t } = useLang();

  return (
    <>
      <div className={`mi-sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`mi-sidebar ${isOpen ? 'mi-sidebar--open' : ''}`}>
        <div className="mi-sidebar-logo">
          <Logo size={26} />
        </div>
        <nav className="mi-sidebar-nav">
          <NavLink to="/" end
            className={({ isActive }) => `mi-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}>
            <FileText size={18} strokeWidth={2} />
            <span>{t('sidebar.invoices')}</span>
          </NavLink>
          <NavLink to="/new"
            className={({ isActive }) => `mi-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}>
            <PlusCircle size={18} strokeWidth={2} />
            <span>{t('sidebar.newInvoice')}</span>
          </NavLink>
          <NavLink to="/history"
            className={({ isActive }) => `mi-nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}>
            <History size={18} strokeWidth={2} />
            <span>{t('sidebar.history')}</span>
          </NavLink>
        </nav>
        <div className="mi-sidebar-footer">
          <button type="button" className="mi-nav-item mi-nav-item--logout" onClick={onLogout}>
            <LogOut size={18} strokeWidth={2} />
            <span>{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}