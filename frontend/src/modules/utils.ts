import Moment from 'moment'

export function formatDate(d) {
    const date = Moment(d)
    return date.format("D.M.Y")
}

export function displayAcademicYears(n) {
    return `${n}/${n+1}`
}