const { addMonths, format, parseISO } = require('date-fns');

/**
 * Calcula la fecha de fin basada en la fecha de inicio y la duración del plan.
 * @param {string} startDate - Fecha de inicio en formato YYYY-MM-DD
 * @param {number} months - Duración en meses
 * @returns {string} - Fecha de fin en formato YYYY-MM-DD
 */
const calculateExpirationDate = (startDate, months) => {
  const date = parseISO(startDate);
  const resultDate = addMonths(date, months);
  return format(resultDate, 'yyyy-MM-dd');
};

module.exports = {
  calculateExpirationDate
};
