import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    FilterCheckbox,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function FormTemplatesPage() {
    const path="form_templates/"
    return <>
        <h1>Modelli</h1>
        <QueryTable 
            path={path}
            sort="name"
            headers={[
                {   
                    field: 'name',
                    label: "nome",
                    enable_sort: true,
                    enable_link: true
                }, {
                    field: 'enabled',
                    label: "attivato",
                    enable_sort: true,
                }]}
            getField={(item, field) => {
                const value = item[field]
                switch(field) {
                    case 'enabled':
                        return value ? "•" : ""
                    default:
                        return value
                }
            }}
            >
            <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterCheckbox name="enabled" label="attivato" />
            </FilterButton>

            <ItemAddButton to={`edit`}>
                Aggiungi Modello
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton cb={async query => []}/>
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

