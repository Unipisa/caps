import React, {useState} from 'react'

import { 
    TableTopRightButtons, 
    FilterButton, FilterInput, FilterCheckbox,
    ItemAddButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from '../components/TableElements'
import {QueryTableCard, QueryTableBar, QueryTable, FilterBadges, SortHeader} from '../components/QueryTable'
import {usePatchUser} from '../modules/engine'

export default function UsersPage({engine}) {
    const [selectedIds,setSelectedIds] = useState([] as string[])
    const patcher = usePatchUser('') // id will be passed with payload

    return <>
        <h1>Utenti</h1>
        <QueryTableCard sort="last_name">
            <QueryTableBar>
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
                <button type="button" className="btn btn-sm btn-danger mr-2"
                    onClick={() => set_admin(true)} disabled={!selectedIds.length}>
                    <span className="d-none d-md-inline ml-2">
                        rendi admin
                    </span>
                </button>
                <button type="button" className="btn btn-sm btn-danger mr-2"
                    onClick={() => set_admin(false)} disabled={!selectedIds.length}>
                    <span className="d-none d-md-inline ml-2">
                        rimuovi da admin
                    </span>
                </button>

                <TableTopRightButtons>
                    <CsvDownloadButton cb={async (query)=>[]}/>
                    <ExcelDownloadButton />
                </TableTopRightButtons>
            </QueryTableBar>
            <FilterBadges />
            <QueryTable path={["users"]} headers={Headers()} renderCells={renderCells} selectedIds={selectedIds} setSelectedIds={setSelectedIds}/>

        </QueryTableCard>
    </>

    function renderCells(item) {
        return <>
            <td><a href={item._id}>{item.id_number}</a></td>
            <td><a href={item._id}>{item.username}</a></td>
            <td><a href={item._id}>{item.email}</a></td>
            <td><a href={item._id}>{item.last_name}</a></td>
            <td><a href={item._id}>{item.first_name}</a></td>
            <td>{item.admin ? "•" : ""}</td>
        </>
    }

    async function set_admin(admin) {
        for (const id of selectedIds) {
            await patcher.mutate({_id: id, admin: admin})
        }
    }
}

function Headers() {
    return <>
        <th><SortHeader field="id_number">matricola</SortHeader></th>
        <th><SortHeader field="username">username</SortHeader></th>
        <th><SortHeader field="email">email</SortHeader></th>
        <th><SortHeader field="last_name">cognome</SortHeader></th>
        <th><SortHeader field="first_name">nome</SortHeader></th>
        <th>admin</th>
    </>
}
