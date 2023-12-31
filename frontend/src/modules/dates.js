import moment from 'moment'

export function formatDate(date) {
    if (date === undefined) return '???'
    if (date === null) return '---'
    date = moment(date)
    return date.format('D.M.YYYY HH:MM')
   }
