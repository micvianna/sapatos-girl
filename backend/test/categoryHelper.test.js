/**
 * Testes unitários para o módulo categoryHelper.js
 */

const { normalizeCategory } = require('../src/utils/categoryHelper');

describe('categoryHelper', () => {
  describe('normalizeCategory', () => {
    it('should return empty string for null, undefined, or empty inputs', () => {
      expect(normalizeCategory(null)).toBe('');
      expect(normalizeCategory(undefined)).toBe('');
      expect(normalizeCategory('')).toBe('');
    });

    it('should normalize standard categories to capitalized Portuguese equivalents', () => {
      expect(normalizeCategory('botas')).toBe('Botas');
      expect(normalizeCategory('BOTAS')).toBe('Botas');
      expect(normalizeCategory('  botas  ')).toBe('Botas');
      
      expect(normalizeCategory('sandálias')).toBe('Sandálias');
      expect(normalizeCategory('sandalias')).toBe('Sandálias');
      expect(normalizeCategory('Sandálias')).toBe('Sandálias');

      expect(normalizeCategory('sapatilhas')).toBe('Sapatilhas');

      expect(normalizeCategory('bolsas')).toBe('Bolsas');
      expect(normalizeCategory('bags')).toBe('Bolsas');
      expect(normalizeCategory('BAGS')).toBe('Bolsas');

      expect(normalizeCategory('acessórios')).toBe('Acessórios');
      expect(normalizeCategory('acessorios')).toBe('Acessórios');
      expect(normalizeCategory('accessories')).toBe('Acessórios');

      expect(normalizeCategory('tênis')).toBe('Tênis');
      expect(normalizeCategory('tenis')).toBe('Tênis');

      expect(normalizeCategory('scarpins')).toBe('Scarpins');
    });

    it('should normalize the new category mules', () => {
      expect(normalizeCategory('mules')).toBe('Mules');
      expect(normalizeCategory('Mules')).toBe('Mules');
      expect(normalizeCategory('  mules  ')).toBe('Mules');
    });

    it('should capitalize the first letter of custom categories', () => {
      expect(normalizeCategory('sneakers')).toBe('Sneakers');
      expect(normalizeCategory('heels')).toBe('Heels');
      expect(normalizeCategory('custom-category')).toBe('Custom-category');
    });
  });
});
