import Logo from './Logo';
import { Mail, Lock, User as UserIcon} from 'lucide-react';

import { useState } from 'react';
import { supabase } from '../supabase';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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

  return (
    <div className="auth-page">
      <div className="auth-card slide-up">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Logo size={40} />
        </div>
        <p className="auth-sub">
          {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuit'}
        </p>

        <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="input-wrap">
                <UserIcon className="input-icon" size={17} />
                <input className="has-icon" type="text" placeholder="Nom complet"
                  value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
            )}
            <div className="input-wrap">
              <Mail className="input-icon" size={17} />
              <input className="has-icon" type="email" placeholder="Email"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="input-wrap">
              <Lock className="input-icon" size={17} />
              <input className="has-icon" type="password" placeholder="Mot de passe (min. 6 caractères)"
                value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn btn-generate" disabled={loading}>
              {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
            </button>
        </form>

        <p className="auth-toggle">
          {mode === 'login' ? "Pas de compte ?" : 'Déjà inscrit ?'}{' '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
            {mode === 'login' ? "S'inscrire" : 'Se connecter'}
          </button>
        </p>
      </div>
    </div>
  );
}