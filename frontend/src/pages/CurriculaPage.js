'use strict';

import React from 'react';
import Curriculum from '../models/Curriculum'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function CurriculaPage() {
    return <>
        <h1>Curricula</h1>
        <QueryTable Model={ Curriculum } >
            <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterInput name="academic_year" label="anno" />
                <FilterInput name="degree" label="laurea" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi Curriculum
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

