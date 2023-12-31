'use strict'

import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable, {QueryTableHeaders, QueryTableBody, FilterBadges} from '../components/QueryTable'

const path = 'forms/'
const headers = [
    {
        field: 'user_last_name',
        label: 'cognome',
        enable_sort: true,
    }, {   
        field: 'user_first_name',
        label: 'nome',
        enable_sort: true,
    }, {   
        field: 'form_template_name',
        label: "modello",
        enable_sort: true,
        enable_link: true,
    }, {
        field: 'date_submitted',
        label: 'data invio',
        enable_sort: true,
    }, {
        field: 'date_managed',
        label: 'data gestione',
        enable_sort: true,
    }]

export default function FormsPage() {
    return <>
        <h1>Moduli</h1>
        <QueryTable sort='date_managed' direction={-1}>
            <QueryTableHeaders>
                <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterInput name="enabled" label="attivato" />
                </FilterButton>

                <TableTopRightButtons>
                    <CsvDownloadButton />
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableHeaders>
            <FilterBadges />
            <QueryTableBody path={path} headers={headers}/>
        </QueryTable>
    </>
}

