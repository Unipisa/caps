'use strict'

import React from 'react'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from './TableElements'
import QueryTable from './QueryTable'
import FormTemplate from '../models/FormTemplate'
import Cache from '../modules/Cache'

export default function FormTemplates() {
    return <>
        <h1>Modelli</h1>
        <QueryTable Model={ FormTemplate } >
            <FilterButton>
            <FilterInput name="name" label="nome" />
            <FilterInput name="enabled" label="attivato" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi Modello
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

