'use strict'

import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'
import Proposal from '../models/Proposal'

export default function Proposals() {
    return <>
        <h1>Piani di studio</h1>
        <QueryTable Model={ Proposal } >
            <FilterButton>
            <FilterInput name="name" label="nome" />
            <FilterInput name="enabled" label="attivato" />
            </FilterButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

