const axios = require('axios');
const { getDaysInMonth, isWeekend, format, addMinutes } = require('date-fns');

async function getHolidays(year) {
  try {
    const response = await axios.get(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    const nationalHolidays = response.data;
    
    // Feriados Estaduais (RJ) e Municipais (Volta Redonda)
    const regionalHolidays = [
      { date: `${year}-04-23`, name: 'São Jorge (Estadual RJ)' },
      { date: `${year}-06-13`, name: 'Dia de Santo Antônio (Padroeiro Volta Redonda)' },
      { date: `${year}-07-17`, name: 'Aniversário de Volta Redonda' }
    ];
    
    return [...nationalHolidays, ...regionalHolidays];
  } catch (error) {
    console.error(`Erro ao buscar feriados de ${year}:`, error.message);
    return [];
  }
}

function generateRandomNoise(min = -10, max = 10) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(baseHour, baseMinute, noiseMinutes) {
  const date = new Date(2000, 0, 1, baseHour, baseMinute);
  const adjusted = addMinutes(date, noiseMinutes);
  return format(adjusted, 'HH:mm');
}

async function generateTimesheetData(year, month) {
  const holidays = await getHolidays(year);
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const days = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = format(date, 'yyyy-MM-dd');
    const isDayWeekend = isWeekend(date);
    const holiday = holidays.find((h) => h.date === dateString);

    if (isDayWeekend) {
      days.push({
        day: String(day).padStart(2, '0'),
        entrada1: '---',
        saida1: '---',
        entrada2: '---',
        saida2: '---',
        isWorkingDay: false,
        note: 'FIM DE SEMANA',
      });
    } else if (holiday) {
      days.push({
        day: String(day).padStart(2, '0'),
        entrada1: '---',
        saida1: '---',
        entrada2: '---',
        saida2: '---',
        isWorkingDay: false,
        note: `FERIADO (${holiday.name})`,
      });
    } else {
      // Base hours: 09:00 - 12:00 (3h) and 13:00 - 18:00 (5h) = 8h
      // We apply the same noise to entrada1 and saida1, so duration is exactly 3h
      // We apply the same noise to entrada2 and saida2, so duration is exactly 5h
      const noise1 = generateRandomNoise(-10, 10);
      const noise2 = generateRandomNoise(-10, 10);

      days.push({
        day: String(day).padStart(2, '0'),
        entrada1: formatTime(9, 0, noise1),
        saida1: formatTime(12, 0, noise1),
        entrada2: formatTime(13, 0, noise2),
        saida2: formatTime(18, 0, noise2),
        isWorkingDay: true,
        note: '',
      });
    }
  }

  return days;
}

module.exports = {
  generateTimesheetData,
};
