'use strict';

import React from 'react'

import User from '../models/User'
import { 
    TableTopRightButtons, 
    FilterButton, FilterInput, FilterCheckbox,
    ItemAddButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function Users({engine}) {
    return <>
        <h1>Utenti</h1>
        <QueryTable engine={engine} Model={ User }>
            <FilterButton>
            <FilterInput name="name" label="nome" />
            <FilterInput name="username" label="username" />
            <FilterInput name="number" label="matricola" />
            <FilterInput name="email" label="email" />
            <FilterCheckbox name="admin" label="admin" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi utente
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}
