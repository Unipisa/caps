'use strict';

import React from 'react';
import User from '../models/User';
import { 
    TableTopRightButtons, 
    FilterButton, FilterInput, FilterCheckbox,
    ItemAddButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from './TableElements';
import QueryTable from './QueryTable';

export default function Users() {
    return <>
        <h1>Utenti</h1>
        <QueryTable Model={ User }>
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
