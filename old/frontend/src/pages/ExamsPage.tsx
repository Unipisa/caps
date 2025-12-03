import React from 'react'
import {
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader } from '../components/QueryTable'

const path=["exams"] 

export default function ExamsPage() {
    return <>
        <h1>Esami</h1>
        <QueryTableCard sort="name">
            <QueryTableBar>
                <FilterButton>
                    <FilterInput name="name" label="nome" />
                    <FilterInput name="code" label="codice" />
                    <FilterInput name="sector" label="settore" />
                    <FilterInput name="credits" label="crediti" />
                </FilterButton>

                <ItemAddButton to="/exams/edit/__new__">
                    Aggiungi esame
                </ItemAddButton>

                <TableTopRightButtons>
                    <CsvDownloadButton cb={async (query)=>[]}/>
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableBar>
            <FilterBadges />
            <QueryTable path={path} headers={Headers()} renderCells={renderCells} />
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

function renderCells(item) {
    return <>
        <td><a href={item._id}>{item.name}</a></td>
        <td>{item.tags.join(", ")}</td>
        <td>{item.code}</td>
        <td>{item.sector}</td>
        <td>{item.credits}</td>
        <td>{item.notes}</td>
    </>
}