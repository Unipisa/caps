'use strict';

import React from 'react';
import Exam from '../models/Exam';
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from './TableElements';
import QueryTable from './QueryTable';

export default function Exams() {
    return <>
        <h1>Esami</h1>
        <QueryTable Model={ Exam } >
            <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterInput name="code" label="codice" />
                <FilterInput name="sector" label="settore" />
                <FilterInput name="credits" label="crediti" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi esame
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}
