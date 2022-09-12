'use strict';

import React from 'react'

import Degree from '../models/Degree'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function Degrees({ engine }) {
    return <>
        <h1>Corsi di Laurea</h1>
        <QueryTable engine={engine} Model={ Degree } >
            <FilterButton>
            <FilterInput name="enabled" label="attivo" />
            <FilterInput name="enable_sharing" label="richiesta parere" />
            <FilterInput name="name" label="nome" />
            <FilterInput name="academic_year" label="anno" />
            <FilterInput name="years" label="anni" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi corso di Laurea
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

