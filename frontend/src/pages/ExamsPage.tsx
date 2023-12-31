import React from 'react'
import {
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges} from '../components/QueryTable'

const path="/exams/" 
const headers=[
    {   
        field: 'name',
        label: "Nome",
        enable_link: true,
        enable_sort: true
    }, {   
        field: 'tags',
        label: "Etichette"
    }, {   
        field: 'code',
        label: "Codice",
        enable_sort: true
    }, {   
        field: 'sector',
        label: "Settore",
        enable_sort: true
    }, {   
        field: 'credits',
        label: "Crediti",
        enable_sort: true 
    }, {
        field: 'notes',
        label: "Note"
    }]

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
            <QueryTable path={path} headers={headers} getField={getField} />
        </QueryTableCard>
    </>

    function getField(item, field) {
        const value = item[field]
        if (field === "tags") return value.join(", ")
        return value
    }
}

