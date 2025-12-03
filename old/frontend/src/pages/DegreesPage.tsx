import React from 'react'

import { displayAcademicYears } from '../modules/utils'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'

export default function DegreesPage() {
    return <>
        <h1>Corsi di Studio</h1>
        <QueryTableCard sort="academic_year" direction={-1}>
            <QueryTableBar>
                <FilterButton>
                <FilterInput name="enabled" label="attivo" />
                <FilterInput name="sharing_mode" label="richiesta parere" />
                <FilterInput name="name" label="nome" />
                <FilterInput name="academic_year" label="anno" />
                <FilterInput name="years" label="anni" />
                </FilterButton>

                <ItemAddButton>
                    Aggiungi corso di studio
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
        <td>{{enabled:"abilitata",disabled:"disabilitata",admin:"amministratori"}[item.sharing_mode]}</td>
        <td>{displayAcademicYears(item.academic_year)}</td>
        <td><a href={item._id}>{item.name}</a></td>
        <td>{item.years}</td>
    </>
}
