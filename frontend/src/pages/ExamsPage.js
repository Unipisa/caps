'use strict';

import React from 'react'

import Exam from '../models/Exam'
import {
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function ExamsPage() {
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

