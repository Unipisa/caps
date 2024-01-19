import React from 'react'

import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'

export default function DegreesPage() {
    return <>
        <h1>Corsi di Laurea</h1>
        <QueryTableCard sort="name">
            <QueryTableBar>
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
            </QueryTableBar>
            <FilterBadges />
            xxx
            <QueryTable path={["degrees"]} headers={Headers()} renderCells={renderCells} />
        </QueryTableCard>
    </>
}

function Headers() {
    return <>
        <th><SortHeader field='name'>nome</SortHeader></th>
        <th>etichette</th>
        <th><SortHeader field='code'>codice</SortHeader></th>
        <th><SortHeader field='sector'>settore</SortHeader></th>
        <th><SortHeader field='credits'>crediti</SortHeader></th>
        <th>note</th>
    </>
}

function Headers_() {
    return <>
        <th>attivo</th>
        <th>richiesta parere</th>
        <th><SortHeader field='academic_year'>anno</SortHeader></th>
        <th><SortHeader field='name'>nome</SortHeader></th>
        <th><SortHeader field='years'>anni</SortHeader></th>
    </>
}

function renderCells(item) {
    return <>
        <td>{item.enabled ? "•" : ""}</td>
        <td>{item.enable_sharing ? "•" : ""}</td>
        <td>{item.academic_year}</td>
        <td><a href={item._id}>{item.name}</a></td>
        <td>{item.years}</td>
    </>
}
