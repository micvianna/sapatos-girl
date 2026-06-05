/**
 * Normaliza parâmetros de categoria para correspondência no banco de dados.
 * @param {string} category
 * @returns {string}
 */
function normalizeCategory(category) {
  if (!category) return '';
  const c = category.toLowerCase().trim();
  if (c === 'botas') return 'Botas';
  if (c === 'sandalias' || c === 'sandálias') return 'Sandálias';
  if (c === 'sapatilhas') return 'Sapatilhas';
  if (c === 'bolsas' || c === 'bags') return 'Bolsas';
  if (c === 'acessorios' || c === 'acessórios' || c === 'accessories') return 'Acessórios';
  if (c === 'tenis' || c === 'tênis') return 'Tênis';
  if (c === 'scarpins') return 'Scarpins';
  if (c === 'mules') return 'Mules';
  
  // Retorna com a primeira letra maiúscula caso seja outra categoria
  return category.charAt(0).toUpperCase() + category.slice(1);
}

module.exports = { normalizeCategory };
