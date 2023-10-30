import React from 'react'

import QueryTable from '../components/QueryTable'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'

const path = "/degrees/"

export default function DegreesPage() {
    return <>
        <h1>Corsi di Laurea</h1>
        <QueryTable 
            path={path} 
            headers={[
                {   
                    field: 'enabled',
                    label: "Attivo",
                }, {   
                    field: 'enable_sharing',
                    label: "Richiesta parere"
                }, {   
                    field: 'academic_year',
                    label: "Anno accademico",
                    enable_sort: true
                }, {   
                    field: 'name',
                    label: "nome",
                    enable_sort: true,
                    enable_link: true
                }, {   
                    field: 'years',
                    label: "Anni",
                    enable_sort: true 
                }]}
            sort="name"
            getField={(item, field) => {
                const value = item[field]
                if (field == "enabled") {
                    return value ? "attivo" : "non attivo"
                } else if (field == "enable_sharing") {
                    return value ? "abilitata" : "non abilitata"
                } else {
                    return value
                }}}
        >
            <FilterButton>
            <FilterInput name="enabled" label="attivo" />
            <FilterInput name="enable_sharing" label="richiesta parere" />
            <FilterInput name="name" label="nome" />
            <FilterInput name="academic_year" label="anno" />
            <FilterInput name="years" label="anni" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi corso di Laurea
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton cb={async (query)=>[]}/>
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

