'use strict'

import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'
import FormTemplate from '../models/FormTemplate'

export default function FormTemplates({engine}) {
    return <>
        <h1>Modelli</h1>
        <QueryTable engine={engine} Model={ FormTemplate } >
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

