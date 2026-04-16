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
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.senha) {
      setLocalError('Email e nova senha são obrigatórios para redefinir.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, novaSenha: formData.senha })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao resetar senha');

      alert('Senha redefinida com sucesso! Agora você pode fazer o Login.');
      setIsResetting(false);
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
        <h2>{isResetting ? 'Redefinir Senha' : t('auth.login')}</h2>

        {(localError || error) && (
          <div className="error-message">{localError || error}</div>
        )}

        <form onSubmit={isResetting ? handleReset : handleSubmit}>
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
            <label>{isResetting ? 'Nova Senha' : t('auth.password')}</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              placeholder={isResetting ? 'Sua nova senha segura' : t('auth.password')}
              required
            />
          </div>

          {!isResetting && (
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">{t('auth.rememberMe')}</label>
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {isResetting ? 'Redefinir Senha' : (loading ? 'Entrando...' : t('auth.signIn'))}
          </button>
        </form>

        {!isResetting && (
          <p className="auth-link" style={{ marginTop: '15px' }}>
            <a onClick={() => setIsResetting(true)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Esqueci minha senha</a>
          </p>
        )}

        {isResetting && (
          <p className="auth-link" style={{ marginTop: '15px' }}>
            <a onClick={() => setIsResetting(false)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>Voltar para o Login</a>
          </p>
        )}

        <p className="auth-link">
          {t('auth.dontHaveAccount')} <a onClick={() => navigate('/register')} style={{ cursor: 'pointer' }}>{t('common.register')}</a>
        </p>
      </div>
    </div>
  );
}
