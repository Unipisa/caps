import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    FilterCheckbox,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable, {QueryTableHeaders, QueryTableBody, FilterBadges} from '../components/QueryTable'

const path="form_templates/"
const headers=[
    {   
        field: 'name',
        label: "nome",
        enable_sort: true,
        enable_link: true
    }, {
        field: 'enabled',
        label: "attivato",
        enable_sort: true,
    }]

export default function FormTemplatesPage() {
    return <>
        <h1>Modelli</h1>
        <QueryTable sort="name">
            <QueryTableHeaders>
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
            </QueryTableHeaders>
            <FilterBadges />
            <QueryTableBody path={path} headers={headers} getField={getField}/>
        </QueryTable>
    </>

    function getField(item, field) {
        const value = item[field]
        switch(field) {
            case 'enabled':
                return value ? "•" : ""
            default:
                return value
        }
    }
}

