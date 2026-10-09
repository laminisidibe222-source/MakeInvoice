import { useState } from 'react';
import {
  Mail, Lock, User as UserIcon, Eye, EyeOff, RefreshCw, Asterisk,
} from 'lucide-react';
import { supabase } from '../supabase';
import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import GoogleLogo from './GoogleLogo';
import { useLang } from '../i18n/LanguageContext';

export default function Auth({ onAuth }) {
  const { t } = useLang();
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
          setError(t('auth.errorConfirmEmail'));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth2-page">
      <div className="auth2-card slide-up">
        {/* LEFT — gradient panel */}
        <div className="auth2-left">
          <Asterisk className="auth2-asterisk" size={30} strokeWidth={2.5} />
          <div className="auth2-left-content">
            <div className="auth2-left-eyebrow">{t('auth.leftEyebrow')}</div>
            <h3 className="auth2-left-title">{t('auth.leftTitle')}</h3>
          </div>
        </div>

        {/* RIGHT — form panel */}
        <div className="auth2-right">
          <div className="auth2-top-row">
            <div className="auth2-logo">
              <Logo size={32} showText={false} />
            </div>
            <LanguageSwitcher />
          </div>

          <h2 className="auth2-title">
            {mode === 'login' ? t('auth.welcomeBack') : t('auth.createAccount')}
          </h2>
          <p className="auth2-subtitle">
            {mode === 'login' ? t('auth.subtitleLogin') : t('auth.subtitleSignup')}
          </p>

          <form onSubmit={handleSubmit} className="auth2-form">
            {mode === 'signup' && (
              <label className="auth2-field">
                <span className="auth2-label">{t('auth.fullName')}</span>
                <div className="auth2-input-wrap">
                  <UserIcon size={16} className="auth2-input-icon" />
                  <input
                    type="text"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth2-field">
              <span className="auth2-label">{t('auth.email')}</span>
              <div className="auth2-input-wrap">
                <Mail size={16} className="auth2-input-icon" />
                <input
                  type="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth2-field">
              <span className="auth2-label">{t('auth.password')}</span>
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
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </label>

            {error && <div className="auth2-error">{error}</div>}

            <button type="submit" className="auth2-submit" disabled={loading}>
              {loading
                ? t('auth.loading')
                : mode === 'login'
                ? t('auth.loginBtn')
                : t('auth.signupBtn')}
            </button>
          </form>

          <div className="auth2-divider">
            <span>{t('auth.orContinueWith')}</span>
          </div>

          {/* Google only */}
          <button
            type="button"
            className="auth2-google"
            onClick={handleGoogle}
            disabled={loading}
            aria-label="Continue with Google"
          >
            <GoogleLogo size={18} />
            <span>Google</span>
          </button>

          <p className="auth2-toggle">
            {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? t('auth.signupLink') : t('auth.loginLink')}
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