import React from 'react'

import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges} from '../components/QueryTable'
import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'

const path = "/degrees/"

const headers=[
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
    }]

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
            <QueryTable path={path} headers={headers} getField={getField} />
        </QueryTableCard>
    </>

    function getField(item, field) {
        const value = item[field]
        if (field == "enabled") {
            return value ? "attivo" : "non attivo"
        } else if (field == "enable_sharing") {
            return value ? "abilitata" : "non abilitata"
        } else {
            return value
        }
    }
}

