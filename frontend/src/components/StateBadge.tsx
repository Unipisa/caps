import React from 'react'
import { Badge } from 'react-bootstrap'

export default function StateBadge({state}:{state: string}) {
    return <Badge text="light" bg={
        {
            'draft': 'primary',
            'submitted': 'warning',
            'approved': 'success',
            'rejected': 'error',
        }[state]
    }>{{
            'draft': 'bozza',
            'submitted': 'inviato',
            'approved': 'approvato',
            'rejected': 'respinto',
        }[state]}
    </Badge>
}
