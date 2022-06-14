exports.convertDateFormat = (timestampDate, isRegisterDate = false) => {
  const date = new Date(timestampDate)
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  const hours = isRegisterDate ? date.getHours() : date.getUTCHours()
  const minutes = date.getUTCMinutes()

  const monthName = {
    0: 'Janeiro',
    1: 'Fevereiro',
    2: 'Março',
    3: 'Abril',
    4: 'Maio',
    5: 'Junho',
    6: 'Julho',
    7: 'Agosto',
    8: 'Setembro',
    9: 'Outubro',
    10: 'Novembro',
    11: 'Dezembro',
  }

  return `${day} de ${monthName[month]} de ${year} às ${hours || '00'}h${
    minutes || '00'
  }`
}
