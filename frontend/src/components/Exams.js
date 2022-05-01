'use strict';

import React, { useState } from 'react';
import models from '../modules/models';
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, QueryTable, ColumnHeader,
    CsvDownloadButton, ExcelDownloadButton,
    } from './TableElements';

function Exams({ flashCatch }) {
    return <>
        <h1>Esami</h1>
        <QueryTable 
            flashCatch={ flashCatch } 
            Model={ models.Exam }
            >
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
                <CsvDownloadButton 
                    self={ this }
                    filename="caps-exams.csv"
                    />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

export default Exams;

