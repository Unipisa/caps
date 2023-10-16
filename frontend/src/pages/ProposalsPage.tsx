import React from 'react'

import { 
    TableTopRightButtons, FilterButton, FilterInput,
    ItemAddButton, CsvDownloadButton, ExcelDownloadButton,
    } from '../components/TableElements'
import QueryTable from '../components/QueryTable'

export default function ProposalsPage() {
    return <>
        <h1>Piani di studio</h1>
        <QueryTable 
            path="proposals/" 
            headers={[
                {
                    field: 'state',
                    label: 'stato',
                },
                {
                    field: 'user_name',
                    label: 'studente',
                    enable_sort: true,
                    enable_link: true,
                }, 
                {
                    field: 'degree_academic_year',
                    label: 'anno',
                    enable_sort: true,
                }, {
                    field: 'degree_name',
                    label: 'laurea',
                    enable_sort: true,
                }, {   
                    field: 'curriculum_name',
                    label: "piano di studio",
                    enable_sort: true,
                }, {
                    field: 'date_submitted',
                    label: 'data invio',
                    enable_sort: true,
                }, {
                    field: 'date_managed',
                    label: 'data gestione',
                    enable_sort: true,
                }]}
            sort="date_managed"
            direction={-1}
        >
            <FilterButton>
            <FilterInput name="name" label="nome" />
            <FilterInput name="enabled" label="attivato" />
            </FilterButton>

            <TableTopRightButtons>
                <CsvDownloadButton cb={async query=>[]}/>
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

