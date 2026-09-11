import '@testing-library/jest-dom';

class ObservadorDeIntersecao {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = ObservadorDeIntersecao;

beforeEach(() => {
  localStorage.clear();
});
