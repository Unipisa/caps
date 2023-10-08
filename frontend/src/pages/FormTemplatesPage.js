'use strict'

import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    FilterCheckbox,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'
import FormTemplate from '../models/FormTemplate'

export default function FormTemplatesPage() {
    return <>
        <h1>Modelli</h1>
        <QueryTable Model={ FormTemplate } >
            <FilterButton>
            <FilterInput name="name" label="nome" />
            <FilterCheckbox name="enabled" label="attivato" />
            </FilterButton>

            <ItemAddButton to="/form_templates/edit">
                Aggiungi Modello
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

