/**
 * Calcula la fecha de fin basada en la fecha de inicio y la duración del plan.
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {number} months - Duración en meses
 * @returns {string} - Fecha de fin en formato YYYY-MM-DD
 */
const calculateExpirationDate = (startDate, months) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

module.exports = {
  calculateExpirationDate
};
