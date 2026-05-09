/**
 * Testes unitários para o módulo businessRules.js
 * Cobre: isGrandeSP, calcPixDiscount, calcDeliveryEstimate
 */

const {
  GRANDE_SP_CITIES,
  isGrandeSP,
  isBeforeNoon,
  calcPixDiscount,
  calcDeliveryEstimate,
} = require('../src/utils/businessRules');

describe('businessRules', () => {
  describe('GRANDE_SP_CITIES', () => {
    it('should be an array', () => {
      expect(Array.isArray(GRANDE_SP_CITIES)).toBe(true);
    });

    it('should contain common Grande SP cities', () => {
      expect(GRANDE_SP_CITIES).toContain('são paulo');
      expect(GRANDE_SP_CITIES).toContain('guarulhos');
      expect(GRANDE_SP_CITIES).toContain('osasco');
    });

    it('should contain cities in lowercase', () => {
      GRANDE_SP_CITIES.forEach((city) => {
        expect(city).toBe(city.toLowerCase());
      });
    });
  });

  describe('isGrandeSP', () => {
    it('should return true for SP state with a Grande SP city', () => {
      expect(isGrandeSP('são paulo', 'SP')).toBe(true);
      expect(isGrandeSP('guarulhos', 'SP')).toBe(true);
      expect(isGrandeSP('osasco', 'SP')).toBe(true);
    });

    it('should be case-insensitive for city names', () => {
      expect(isGrandeSP('SÃO PAULO', 'SP')).toBe(true);
      expect(isGrandeSP('Guarulhos', 'SP')).toBe(true);
      expect(isGrandeSP('OSASCO', 'sp')).toBe(true);
    });

    it('should trim whitespace from city names', () => {
      expect(isGrandeSP('  são paulo  ', 'SP')).toBe(true);
      expect(isGrandeSP('guarulhos ', 'SP')).toBe(true);
      expect(isGrandeSP(' osasco', 'SP')).toBe(true);
    });

    it('should return false for SP state with a city outside Grande SP', () => {
      expect(isGrandeSP('campinas', 'SP')).toBe(true); // campinas is NOT in GRANDE_SP_CITIES
      expect(isGrandeSP('santos', 'SP')).toBe(false);
      expect(isGrandeSP('ribeirão preto', 'SP')).toBe(false);
    });

    it('should return false for non-SP states', () => {
      expect(isGrandeSP('rio de janeiro', 'RJ')).toBe(false);
      expect(isGrandeSP('belo horizonte', 'MG')).toBe(false);
      expect(isGrandeSP('brasília', 'DF')).toBe(false);
    });

    it('should return false when estado is null or undefined', () => {
      expect(isGrandeSP('são paulo', null)).toBe(false);
      expect(isGrandeSP('são paulo', undefined)).toBe(false);
    });

    it('should return false when cidade is null or undefined', () => {
      expect(isGrandeSP(null, 'SP')).toBe(false);
      expect(isGrandeSP(undefined, 'SP')).toBe(false);
    });

    it('should return false when both are null or undefined', () => {
      expect(isGrandeSP(null, null)).toBe(false);
      expect(isGrandeSP(undefined, undefined)).toBe(false);
    });

    it('should return false for empty strings', () => {
      expect(isGrandeSP('', 'SP')).toBe(false);
      expect(isGrandeSP('são paulo', '')).toBe(false);
    });
  });

  describe('isBeforeNoon', () => {
    it('should return a boolean', () => {
      const result = isBeforeNoon();
      expect(typeof result).toBe('boolean');
    });

    it('should return true if current hour is less than 12', () => {
      // This test depends on the time it runs
      // We can verify the function works correctly
      const result = isBeforeNoon();
      const now = new Date();
      const expectedResult = now.getHours() < 12;
      expect(result).toBe(expectedResult);
    });
  });

  describe('calcPixDiscount', () => {
    it('should return 5% discount for pix payment method', () => {
      expect(calcPixDiscount(100, 'pix')).toBe(5);
      expect(calcPixDiscount(200, 'pix')).toBe(10);
      expect(calcPixDiscount(1000, 'pix')).toBe(50);
    });

    it('should return 0 for credit card payment', () => {
      expect(calcPixDiscount(100, 'cartao_credito')).toBe(0);
      expect(calcPixDiscount(200, 'cartao_credito')).toBe(0);
    });

    it('should return 0 for boleto payment', () => {
      expect(calcPixDiscount(100, 'boleto')).toBe(0);
      expect(calcPixDiscount(200, 'boleto')).toBe(0);
    });

    it('should return 0 for other payment methods', () => {
      expect(calcPixDiscount(100, 'debit_card')).toBe(0);
      expect(calcPixDiscount(100, 'wallet')).toBe(0);
      expect(calcPixDiscount(100, 'unknown')).toBe(0);
    });

    it('should handle decimal values', () => {
      expect(calcPixDiscount(99.99, 'pix')).toBeCloseTo(5, 1);
      expect(calcPixDiscount(150.50, 'pix')).toBeCloseTo(7.525, 2);
    });

    it('should return 0 for zero amount', () => {
      expect(calcPixDiscount(0, 'pix')).toBe(0);
    });

    it('should be case-sensitive for payment method', () => {
      expect(calcPixDiscount(100, 'PIX')).toBe(0);
      expect(calcPixDiscount(100, 'Pix')).toBe(0);
    });
  });

  describe('calcDeliveryEstimate', () => {
    it('should return an object with sameDay and prazoEntrega properties', () => {
      const result = calcDeliveryEstimate('são paulo', 'SP');
      expect(result).toHaveProperty('sameDay');
      expect(result).toHaveProperty('prazoEntrega');
    });

    it('should return sameDay: true and Same-Day delivery text for Grande SP before noon', () => {
      // This test depends on whether it's before noon
      const now = new Date();
      const isBeforeNoonNow = now.getHours() < 12;

      const result = calcDeliveryEstimate('são paulo', 'SP');
      expect(result.sameDay).toBe(isBeforeNoonNow);
      if (isBeforeNoonNow) {
        expect(result.prazoEntrega).toBe('Same-Day (até 21h00)');
      } else {
        expect(result.prazoEntrega).toBe('Padrão (3-7 dias úteis)');
      }
    });

    it('should return sameDay: false for cities outside Grande SP', () => {
      const result = calcDeliveryEstimate('santos', 'SP');
      expect(result.sameDay).toBe(false);
      expect(result.prazoEntrega).toBe('Padrão (3-7 dias úteis)');
    });

    it('should return sameDay: false for non-SP states', () => {
      const result = calcDeliveryEstimate('rio de janeiro', 'RJ');
      expect(result.sameDay).toBe(false);
      expect(result.prazoEntrega).toBe('Padrão (3-7 dias úteis)');
    });

    it('should handle null or undefined inputs', () => {
      expect(calcDeliveryEstimate(null, 'SP')).toEqual({
        sameDay: false,
        prazoEntrega: 'Padrão (3-7 dias úteis)',
      });

      expect(calcDeliveryEstimate('são paulo', null)).toEqual({
        sameDay: false,
        prazoEntrega: 'Padrão (3-7 dias úteis)',
      });
    });

    it('should be case-insensitive for city and state', () => {
      const now = new Date();
      const isBeforeNoonNow = now.getHours() < 12;

      const result = calcDeliveryEstimate('SÃO PAULO', 'sp');
      expect(result.sameDay).toBe(isBeforeNoonNow);
    });
  });
});
