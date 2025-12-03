import React, { useState, createContext, useContext, Dispatch, SetStateAction } from 'react'

import { useIndex } from '../modules/engine'
import { Link } from "react-router-dom"
import LoadingMessage from './LoadingMessage'
import { Card } from 'react-bootstrap'

import {formatDate} from '../modules/dates'
import StateBadge from './StateBadge'

interface IQuery {
    _limit: number,
    _sort: string,
    _direction: number,
    [key: string]: any,
}

interface IQueryContext {
    query: IQuery,
    setQuery: React.Dispatch<React.SetStateAction<IQuery>>,
}

interface IQueryTableHeader {
    field: string,
    label: string,
    enable_sort?: boolean,
    enable_link?: boolean,
}

export const QueryTableContext = createContext<IQueryContext|null>(null)

export const QueryTableProvider = QueryTableContext.Provider
  
export function useQuery() {
    return useContext(QueryTableContext)
}

export function QueryTableCard<T>({ sort, direction, children }:{
    sort: string,
    direction?: number,
    children?: any,
}) {
    const [ query, setQuery ] = useState<IQuery>({
        _limit: 10,
        _sort: sort,
        _direction: direction || 1,
    })
    return <Card className="shadow my-2">
        <Card.Body>
            <QueryTableProvider value={{query, setQuery}}>
                {children}
            </QueryTableProvider>
        </Card.Body>
    </Card>
}

export function QueryTableBar({ children }) {
    return <div className="d-flex mb-2">
        {children}
    </div>

}

export function QueryTable<T extends {_id:string}>({ path, headers, renderCells, selectedIds, setSelectedIds}:{
    path: string[],
    headers: JSX.Element|JSX.Element[],
    renderCells: (item: T) => JSX.Element|JSX.Element[],
    selectedIds?: string[],
    setSelectedIds?: Dispatch<SetStateAction<string[]>>,
}) {
    return <div className="table-responsive-lg">
        <TableItems<T> path={path} selectedIds={selectedIds} setSelectedIds={setSelectedIds}>
            <thead>
                <tr>
                    <th></th>
                    { headers }
                </tr>
            </thead> 
            <TableBody<T> renderCells={renderCells}/>
        </TableItems>
    </div>
}

export function defaultGetField(item, field:string) {
    let value = item
    const segments:string[] = field.split('.')
    segments.forEach(f => {value = value[f]})
    const last = segments[segments.length - 1]
    if (["date_submitted", "date_modified", "date_managed"]
        .includes(last)) return formatDate(value)
    if (last === 'state') return <StateBadge state={value}/>
    return value
}

export function FilterBadges() {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx
    function onRemoveField(field) {
        setQuery(q => {
            const { [field]: _, ...rest } = q
            return rest as IQuery
        })
    }

    let entries = Object.entries(query).filter(([field, value]) => !field.startsWith('_'));
    if (entries.length == 0) return null;
    return <div className="d-flex align-left my-2">
        { entries.map(([field, value]) => {
            return <a 
                        key={field} 
                        style={{cursor: 'pointer'}} 
                        className="filter-badge-link" 
                        onClick={() => onRemoveField(field)}>
                <span className="filter-badge badge badge-secondary mr-2" title={`rimuovi il filtro ${field}: ${value}`}>
                    {`${field}: ${value} X`}
                </span>
            </a>;
            })}
    </div>
}

const ItemsContext = createContext<{
    items: any[],
    selectedIds?: string[],
    setSelectedIds?: React.Dispatch<React.SetStateAction<string[]>>,
}>({
    items: [], 
    selectedIds: undefined, 
    setSelectedIds: undefined,
})

export function useItems<T extends {_id: string}>() {
    return useContext(ItemsContext).items as T[]
}

export function useSelectedIds() {
    return useContext(ItemsContext).selectedIds
}

export function useSetSelectedIds() {
    return useContext(ItemsContext).setSelectedIds
}

function TableItems<T>({ path, selectedIds, setSelectedIds, children }: {
    path:string[],
    children?: any,
    selectedIds?: string[],
    setSelectedIds?: Dispatch<SetStateAction<string[]>>,
}) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx 
    const indexQuery = useIndex<T>(path, query)
    console.log(`useIndex ${path}`)
    
    if (indexQuery.isError) return <>ERRORE</>
    if (indexQuery.data === undefined) return <LoadingMessage/>

    const data = indexQuery.data
    const items = data.items
    
    return <ItemsContext.Provider value={{items, selectedIds, setSelectedIds}}>
        {items.length}/{data.total} elementi mostrati
        <table className="table">
            { children }
        </table>
        <p>
            { items.length < data.total 
            ? <button className="btn btn-primary mx-auto d-block" onClick={ () => increaseLimit(10) } >
                Carica più righe (altri {`${ data.total - items.length} / ${ data.total }`} da mostrare)
            </button>
            : null
            }
        </p>
    </ItemsContext.Provider>

    function increaseLimit(d) {
        setQuery(q => {
            return {...q,
                _limit: q._limit + d
            }
        })
    }
}

export function SortHeader({ field, children }) {
    const { query, setQuery } = useQuery() || {}

    if (query && setQuery) {
        return <a href="#" onClick={() => toggleSort(field, setQuery)}>
            { children }&nbsp;{
                (query._sort === field) 
                    ? (query._direction > 0 ? <>↓</> : <>↑</>) 
                    : ""}
        </a>
    } else {
        return children
    }

    function toggleSort(field, setQuery) {
        setQuery(q => {
            if (q._sort == field) {
                return {
                    ...q,
                    _direction: -q._direction
                }
            } else {
                return {
                    ...q,
                    _sort: field,
                    _direction: 1
                }
            }
        })
    }
}    

function TableBody<T extends {_id:string}>({ renderCells }:{
    renderCells: (item: T) => JSX.Element|JSX.Element[],
}) {
    const items = useItems<T>()
    const selectedIds = useSelectedIds()
    const setSelectedIds = useSetSelectedIds()
    return <tbody>
        { items.map(item => {
            const selected = selectedIds && selectedIds.includes(item._id)
            return <tr 
                key={ item._id } 
                style={ selected ? {background: "lightgray" } : {}}>
                <td><input type="checkbox" checked={ selected } readOnly onClick={ () => onToggle(item) }/></td>
                {renderCells(item)}
                <td />
            </tr>})
        }
    </tbody>            

    function onToggle(item) {
        if (!setSelectedIds) return
        setSelectedIds(ids => {
            if (ids.includes(item._id)) {
                return ids.filter(id => id !== item._id);
            } else {
                return [...ids, item._id];
            }
        })
    }
}
