'use strict';

import React from 'react';
import Degree from '../models/Curriculum';
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from './TableElements';
import QueryTable from './QueryTable';
import Cache from '../modules/Cache';

export default function Curricula() {
    return <>
        <h1>Curricula</h1>
        <QueryTable Model={ Degree } >
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

