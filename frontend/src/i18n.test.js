test.each([null,'en-US','es'])('carrega idioma salvo ou português padrão', language => {
  if (language) localStorage.setItem('language',language);
  jest.isolateModules(() => {
    const i18n = require('./i18n').default;
    expect(i18n.language).toBe(language || 'pt-BR');
    expect(i18n.t('auth.login')).not.toBe('auth.login');
    expect(i18n.options.fallbackLng).toContain('pt-BR');
  });
});
