import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store';
import API_URL from '../config/api';
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
  const [resetStep, setResetStep] = useState('none'); // 'none' | 'request' | 'confirm'
  const [resetToken, setResetToken] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setLocalError(t('auth.emailRequired'));
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/reset/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('auth.resetError'));

      // Em ambiente de desenvolvimento, o backend retorna o token
      if (data.resetToken) {
        setResetToken(data.resetToken);
        setResetStep('confirm');
        setLocalError('');
      } else {
        alert(data.message);
        setResetStep('none');
        setFormData({ email: '', senha: '' });
        setLocalError('');
      }
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    if (!formData.senha) {
      setLocalError(t('auth.emailRequired'));
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/auth/reset/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: resetToken, novaSenha: formData.senha })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || t('auth.resetError'));

      alert(t('auth.resetSuccess'));
      setResetStep('none');
      setResetToken('');
      setFormData({ email: '', senha: '' });
      setLocalError('');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.senha) {
      setLocalError(t('auth.emailRequired'));
      return;
    }

    try {
      const data = await login(formData.email, formData.senha);
      if (data?.user?.is_admin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setLocalError(err.response?.data?.error || t('auth.errorLogin'));
    }
  };

  const isResetting = resetStep !== 'none';

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isResetting ? t('auth.resetPassword') : t('auth.login')}</h2>

        {(localError || error) && (
          <div className="error-message">{localError || error}</div>
        )}

        {resetStep === 'none' && (
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
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>
        )}

        {resetStep === 'request' && (
          <form onSubmit={handleResetRequest}>
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

            <button type="submit" className="btn btn-primary">
              {t('auth.resetCta')}
            </button>
          </form>
        )}

        {resetStep === 'confirm' && (
          <form onSubmit={handleResetConfirm}>
            <div className="form-group">
              <label>{t('auth.newPassword')}</label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder={t('auth.newPasswordPlaceholder')}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              {t('auth.resetCta')}
            </button>
          </form>
        )}

        {resetStep === 'none' && (
          <p className="auth-link" style={{ marginTop: '15px' }}>
            <button type="button" className="link-button" onClick={() => setResetStep('request')}>{t('auth.forgotPassword')}</button>
          </p>
        )}

        {isResetting && (
          <p className="auth-link" style={{ marginTop: '15px' }}>
            <button type="button" className="link-button" onClick={() => { setResetStep('none'); setLocalError(''); }}>{t('auth.backToLogin')}</button>
          </p>
        )}

        <p className="auth-link">
          {t('auth.dontHaveAccount')} <button type="button" className="link-button" onClick={() => navigate('/register')}>{t('common.register')}</button>
        </p>
      </div>
    </div>
  );
}
