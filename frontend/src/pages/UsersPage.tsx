import React from 'react'

import { 
    TableTopRightButtons, 
    FilterButton, FilterInput, FilterCheckbox,
    ItemAddButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import QueryTable, {QueryTableHeaders, QueryTableBody, FilterBadges} from '../components/QueryTable'

const path="/users" 
const headers=[
    {   
        field: 'id_number',
        label: "Matricola",
        enable_link: true,
        enable_sort: true
    }, {   
        field: 'username',
        label: "Username",
        enable_link: true,
        enable_sort: true 
    }, {   
        field: 'email',
        label: "Email",
        enable_sort: true
    }, {   
        field: 'last_name',
        label: "Cognome",
        enable_link: true,
        enable_sort: true
    }, {   
        field: 'first_name',
        label: "Nome",
        enable_link: true,
        enable_sort: true
    }, {
        field: 'admin',
        label: "admin"
    }]

export default function UsersPage({engine}) {
    return <>
        <h1>Utenti</h1>
        <QueryTable sort="last_name">
            <QueryTableHeaders>
                <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterInput name="username" label="username" />
                <FilterInput name="id_number" label="matricola" />
                <FilterInput name="email" label="email" />
                <FilterCheckbox name="admin" label="admin" />
                </FilterButton>

                <ItemAddButton>
                    Aggiungi utente
                </ItemAddButton>

                <TableTopRightButtons>
                    <CsvDownloadButton cb={async (query)=>[]}/>
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableHeaders>
            <FilterBadges />
            <QueryTableBody path={path} headers={headers} getField={getField} />
        </QueryTable>
    </>

    function getField(item, field) {
        const value = item[field]
        if (field === "admin") return value ? "•" : ""
        return value
    }
}
