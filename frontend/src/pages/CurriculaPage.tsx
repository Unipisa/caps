import React from 'react'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'

export default function CurriculaPage() {
    return <>
        <h1>Curricula</h1>
        <QueryTableCard sort="name">
            <QueryTableBar>
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
            </QueryTableBar>
            <FilterBadges />
            <QueryTable path="/curricula" headers={Headers()} renderCells={renderCells}/>
        </QueryTableCard>
    </>
}

function renderCells(item) {
    return <>
        <td>{item.degree.academic_year}</td>
        <td>{item.degree.name}</td>
        <td><a href={item._id}>{item.name}</a></td>
    </>
}

function Headers() {
    return <>
        <th><SortHeader field="degree.academic_year">anno</SortHeader></th>
        <th><SortHeader field="degree.name">laurea</SortHeader></th>
        <th><SortHeader field="name">nome</SortHeader></th>
    </>
}

