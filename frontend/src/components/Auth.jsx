import { useState } from 'react';
import {
  Mail, Lock, User as UserIcon, Eye, EyeOff, RefreshCw, Asterisk,
} from 'lucide-react';
import { supabase } from '../supabase';
import Logo from './Logo';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        if (data.session) {
          onAuth(data.session);
        } else {
          setError('Vérifiez votre email pour confirmer votre compte.');
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = (provider) => {
    setError(`Connexion via ${provider} bientôt disponible.`);
  };

  return (
    <div className="auth2-page">
      <div className="auth2-card slide-up">
        {/* LEFT — gradient panel */}
        <div className="auth2-left">
          <Asterisk className="auth2-asterisk" size={30} strokeWidth={2.5} />
          <div className="auth2-left-content">
            <div className="auth2-left-eyebrow">Vous pouvez facilement</div>
            <h3 className="auth2-left-title">
              Accédez à votre espace personnel pour créer vos factures en toute clarté.
            </h3>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="auth2-right">
          <div className="auth2-logo">
            <Logo size={32} showText={false} />
          </div>

          <h2 className="auth2-title">
            {mode === 'login' ? 'Connectez-vous' : 'Créez un compte'}
          </h2>
          <p className="auth2-subtitle">
            {mode === 'login'
              ? 'Accédez à vos factures, à tout moment, en un seul endroit.'
              : 'Quelques secondes suffisent pour commencer à facturer.'}
          </p>

          <form onSubmit={handleSubmit} className="auth2-form">
            {mode === 'signup' && (
              <label className="auth2-field">
                <span className="auth2-label">Nom complet</span>
                <div className="auth2-input-wrap">
                  <UserIcon size={16} className="auth2-input-icon" />
                  <input
                    type="text"
                    placeholder="Ex : Aly Diop"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth2-field">
              <span className="auth2-label">Votre email</span>
              <div className="auth2-input-wrap">
                <Mail size={16} className="auth2-input-icon" />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth2-field">
              <span className="auth2-label">Mot de passe</span>
              <div className="auth2-input-wrap">
                <Lock size={16} className="auth2-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="auth2-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Afficher le mot de passe"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error && <div className="auth2-error">{error}</div>}

            <button type="submit" className="auth2-submit" disabled={loading}>
              {loading
                ? 'Chargement...'
                : mode === 'login'
                ? 'Se connecter'
                : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth2-divider">
            <span>ou continuer avec</span>
          </div>

          <div className="auth2-socials">
            <button type="button" className="auth2-social" onClick={() => handleSocial('Bépo')}>
              Bé
            </button>
            <button type="button" className="auth2-social" onClick={() => handleSocial('Google')}>
              <span className="auth2-social-g">G</span>
            </button>
            <button type="button" className="auth2-social" onClick={() => handleSocial('Facebook')}>
              <span className="auth2-social-f">f</span>
            </button>
          </div>

          <p className="auth2-toggle">
            {mode === 'login' ? 'Pas de compte ? ' : 'Déjà inscrit ? '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>

        <button className="auth2-refresh" type="button" aria-hidden="true" tabIndex={-1}>
          <RefreshCw size={16} />
        </button>
      </div>
    </div>
  );
}