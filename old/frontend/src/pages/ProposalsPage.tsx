import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    CsvDownloadButton, ExcelDownloadButton, FilterSelect,
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'
import { ProposalGet } from '../modules/engine'
import { formatDate } from '../modules/dates'
import StateBadge from '../components/StateBadge'

const path = ["proposals"]

export default function ProposalsPage() {
    return <>
        <h1>Piani di studio</h1>
        <QueryTableCard sort="date_managed" direction={-1}>
            <QueryTableBar>
                <FilterButton>
                <FilterSelect name="state" label="stato">
                    <option value="">qualunque</option>
                    <option value="draft">bozza</option>
                    <option value="submitted">inviato</option>
                    <option value="approved">approvato</option>
                    <option value="rejected">respinto</option>
                </FilterSelect>
                <FilterInput name="user_last_name" label="cognome" />
                <FilterInput name="degree_academic_year" label="anno" />
                <FilterInput name="degree_name" label="laurea" />
                <FilterInput name="curriculum_name" label="curriculum" />
                <FilterInput name="" label="nome esame" />
                </FilterButton>
                <TableTopRightButtons>
                    <CsvDownloadButton cb={async query=>[]}/>
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableBar>
            <FilterBadges/>
            <QueryTable<ProposalGet> path={path} headers={Headers()} renderCells={renderCells}>
            </QueryTable>
        </QueryTableCard>
    </>

    function renderCells(item: ProposalGet) {
        return <>
            <td><StateBadge state={item.state}/></td>
            <td><a href={item._id}>{item.user_name}</a></td>
            <td>{item.degree_academic_year}</td>
            <td>{item.degree_name}</td>
            <td>{item.curriculum_name}</td>
            <td>{formatDate(item.date_submitted)}</td>
            <td>{formatDate(item.date_managed)}</td>
        </>
    }
}

function Headers() {
    return <>
        <th>stato</th>
        <th><SortHeader field='user_name'>studente</SortHeader></th>
        <th><SortHeader field='degree_academic_year'>anno</SortHeader></th>
        <th><SortHeader field='degree_name'>laurea</SortHeader></th>
        <th><SortHeader field='curriculum_name'>piano di studio</SortHeader></th>
        <th><SortHeader field='date_submitted'>data invio</SortHeader></th>
        <th><SortHeader field='date_managed'>data gestione</SortHeader></th>
    </>
}
