/**
 * Frontend mirror das regras de negócio para PREVIEW da UI.
 *
 * IMPORTANTE: Estas funções existem apenas para exibir estimativas em tempo real
 * (ex.: desconto Pix antes de confirmar o pedido). O cálculo definitivo é
 * feito exclusivamente pelo backend em backend/src/utils/businessRules.js
 * — qualquer divergência será reconciliada pelo servidor.
 */

/**
 * RN02: Desconto Pix (5% do total).
 * @param {number} total
 * @param {string} metodoPagamento
 * @returns {number}
 */
export function calcPixDiscount(total, metodoPagamento) {
  return metodoPagamento === 'pix' ? parseFloat(total) * 0.05 : 0;
}
