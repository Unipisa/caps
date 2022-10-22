'use strict'

import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'
import Form from '../models/Form'

export default function Forms() {
    return <>
        <h1>Moduli</h1>
        <QueryTable Model={ Form } >
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

