/**
 * Módulo centralizado de regras de negócio.
 * Concentra lógica de Grande SP, desconto Pix e anti-fraude
 * para evitar duplicação entre backend e frontend.
 */

// RN04: Cidades da Grande São Paulo elegíveis para entrega Same-Day
const GRANDE_SP_CITIES = [
  'são paulo', 'sao paulo', 'guarulhos', 'campinas', 'são bernardo do campo',
  'sao bernardo do campo', 'santo andré', 'santo andre', 'osasco', 'barueri',
  'são caetano do sul', 'sao caetano do sul', 'diadema', 'mauá', 'maua',
  'carapicuíba', 'carapicuiba', 'mogi das cruzes', 'suzano', 'taboão da serra',
  'taboao da serra', 'itaquaquecetuba', 'embu das artes', 'cotia', 'itapecerica da serra',
  'itapevi', 'jandira', 'santana de parnaíba', 'cajamar', 'franco da rocha',
  'caieiras', 'aruja', 'ferraz de vasconcelos', 'poá', 'poa',
  'ribeirão pires', 'ribeirao pires', 'rio grande da serra'
];

/**
 * Verifica se a cidade pertence à região da Grande São Paulo.
 * @param {string} cidade
 * @param {string} estado
 * @returns {boolean}
 */
function isGrandeSP(cidade, estado) {
  if (!cidade || !estado) return false;
  return estado.toUpperCase() === 'SP' && GRANDE_SP_CITIES.includes(cidade.toLowerCase().trim());
}

/**
 * Verifica se o horário atual é anterior ao meio-dia (12h).
 * @returns {boolean}
 */
function isBeforeNoon() {
  const now = new Date();
  return now.getHours() < 12;
}

/**
 * RN02: Calcula o desconto Pix (5% do total).
 * @param {number} total
 * @param {string} metodoPagamento
 * @returns {number}
 */
function calcPixDiscount(total, metodoPagamento) {
  return metodoPagamento === 'pix' ? total * 0.05 : 0;
}

/**
 * RN04: Determina o prazo de entrega baseado na localização e horário.
 * @param {string} cidade
 * @param {string} estado
 * @returns {{ sameDay: boolean, prazoEntrega: string }}
 */
function calcDeliveryEstimate(cidade, estado) {
  const sameDay = isGrandeSP(cidade, estado) && isBeforeNoon();
  const prazoEntrega = sameDay ? 'Same-Day (até 21h00)' : 'Padrão (3-7 dias úteis)';
  return { sameDay, prazoEntrega };
}

module.exports = {
  GRANDE_SP_CITIES,
  isGrandeSP,
  isBeforeNoon,
  calcPixDiscount,
  calcDeliveryEstimate,
};
