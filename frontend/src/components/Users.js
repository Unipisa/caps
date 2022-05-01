'use strict';

import React from 'react';
import User from '../models/User';
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from './TableElements';
import QueryTable from './QueryTable';

export default function Users({ flashCatch }) {
    return <>
        <h1>Utenti</h1>
        <QueryTable Model={ User } flashCatch={ flashCatch } >
            <FilterButton>
                <FilterInput name="name" label="nome" />
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
