import { calcPixDiscount } from './businessRules';

describe('Regra de desconto Pix', () => {
  test('calcula cinco por cento para pagamento Pix', () => {
    expect(calcPixDiscount('200.00', 'pix')).toBe(10);
  });

  test('não aplica desconto para outro método de pagamento', () => {
    expect(calcPixDiscount(200, 'cartao_credito')).toBe(0);
  });
});
