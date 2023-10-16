import React from 'react'
import Moment from 'moment'
import { Badge } from 'react-bootstrap'

import Model from './Model'

export default class Proposal extends Model {
    constructor(json) {
        super(json)
        this.date_submitted = Moment(this.date_submitted)
        this.date_managed = Moment(this.date_managed)
    }

    badge() {
        return <Badge text="light" bg={
            {
                'draft': 'primary',
                'submitted': 'warning',
                'approved': 'success',
                'rejected': 'error',
            }[this.state]
        }>{{
                'draft': 'bozza',
                'submitted': 'inviato',
                'approved': 'approvato',
                'rejected': 'respinto',
            }[this.state]}
        </Badge>
    }

    degree_academic_years() {
        if (!this.degree_academic_year) return null
        return `${this.degree_academic_year}/${this.degree_academic_year + 1}`
    }
}
