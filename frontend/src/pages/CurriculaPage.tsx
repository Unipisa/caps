import React from 'react'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable, {QueryTableHeaders, QueryTableBody, FilterBadges} from '../components/QueryTable'

const path = "/curricula/"
const headers=[
    {   
        field: 'degree.academic_year',
        label: "Anno",
        enable_sort: true
    }, {   
        field: 'degree.name',
        label: "laurea",
        enable_sort: true,
        enable_link: true
    }, {   
        field: 'name',
        label: "nome",
        enable_sort: true,
        enable_link: true
    }]

export default function CurriculaPage() {
    return <>
        <h1>Curricula</h1>
        <QueryTable sort="name">
            <QueryTableHeaders>
                <FilterButton>
                    <FilterInput name="name" label="nome" />
                    <FilterInput name="academic_year" label="anno" />
                    <FilterInput name="degree" label="laurea" />
                </FilterButton>

                <ItemAddButton>
                    Aggiungi Curriculum
                </ItemAddButton>

                <TableTopRightButtons>
                    <CsvDownloadButton cb={async (query) => []}/>
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableHeaders>
            <FilterBadges />
            <QueryTableBody path={path} headers={headers}/>
        </QueryTable>
    </>
}

