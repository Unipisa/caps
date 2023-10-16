import React from 'react'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

const path = "/curricula/"

export default function CurriculaPage() {
    return <>
        <h1>Curricula</h1>
        <QueryTable 
            path={path} 
            headers={[
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
                }]}
            sort="name"
        >
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
        </QueryTable>
    </>
}

