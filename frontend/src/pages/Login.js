import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';
import './Auth.css';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loading, error } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.senha) {
      setLocalError('Email e senha são obrigatórios');
      return;
    }

    try {
      await login(formData.email, formData.senha);
      navigate('/');
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Erro ao fazer login');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t('auth.login')}</h2>
        
        {(error || localError) && (
          <div className="error-message">{error || localError}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('auth.email')}
              required
            />
          </div>

          <div className="form-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder={t('auth.password')}
              required
            />
          </div>

          <div className="remember-me">
            <input type="checkbox" id="remember" />
            <label htmlFor="remember">{t('auth.rememberMe')}</label>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : t('auth.signIn')}
          </button>
        </form>

        <p className="auth-link">
          {t('auth.dontHaveAccount')} <a onClick={() => navigate('/register')}>{t('common.register')}</a>
        </p>
      </div>
    </div>
  );
}
