import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    FilterCheckbox,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'

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
        <QueryTableCard sort="name">
            <QueryTableBar>
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
            </QueryTableBar>
            <FilterBadges />
            <QueryTable path={path} headers={Headers()} renderCells={renderCells}/>
        </QueryTableCard>
    </>
}

function Headers() {
    return <>
        <th><SortHeader field='name'>nome</SortHeader></th>
        <th><SortHeader field='enabled'>attivato</SortHeader></th>
    </>
}

function renderCells(item) {
    return <>
        <td><a href={item._id}>{item.name}</a></td>
        <td>{item.enabled? "•" : ""}</td>
    </>
}