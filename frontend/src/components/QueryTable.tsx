import React, { useState, createContext, useContext } from 'react'

import { useIndex } from '../modules/engine'
import { Link } from "react-router-dom"
import LoadingMessage from './LoadingMessage'
//import Card from './Card'
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

export default function QueryTable<T>({ sort, direction, children }:{
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

export function QueryTableHeaders({ children }) {
    return <div className="d-flex mb-2">
        {children}
    </div>

}

export function QueryTableBody<T>({ path, headers, getField}:{
    path: string,
    headers: IQueryTableHeader[],
    getField?: (item: any, field: string) => JSX.Element | string,
    children?: any,
}) {
    return <div className="table-responsive-lg">
        <Table<T> path={path} headers={headers} getField={getField}/>
    </div>
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

function Table<T>({ path, headers, getField }: {
    path:string,
    headers: IQueryTableHeader[],
    getField?: (item: any, field: string) => JSX.Element | string,
}) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx 
    const indexQuery = useIndex<T>(path, query)
    const [ selectedIds, setSelectedIds ] = useState<string[]>([])
    
    if (indexQuery.isError) return <>ERRORE</>
    if (indexQuery.data === undefined) return <LoadingMessage/>

    const data = indexQuery.data
    const items = data.items
    
    return <>
        {items.length}/{data.total} elementi mostrati
        <table className="table">
            <thead>
                <tr>
                    <th></th>
                    { headers.map( ({ field, label, enable_sort }) => 
                        <th key={ field }> 
                            <Header field={ field } label={ label } enable_sort={ enable_sort } />
                        </th> 
                    )}
                </tr>
            </thead>        
            <TableBody 
                path={path} 
                headers={headers} 
                items={ items } 
                selectedIds={ selectedIds } 
                setSelectedIds={ setSelectedIds } 
                getField={ getField }    
            />
        </table>
        <p>
            { items.length < data.total 
            ? <button className="btn btn-primary mx-auto d-block" onClick={ () => increaseLimit(10) } >
                Carica più righe (altri {`${ data.total - items.length} / ${ data.total }`} da mostrare)
            </button>
            : null
            }
        </p>
    </>

    function toggleSort(field) {
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

    function increaseLimit(d) {
        setQuery(q => {
            return {...q,
                _limit: q._limit + d
            }
        })
    }

    function Header({ field, label, enable_sort }) {
        if (enable_sort) {
            return <a href="#" onClick={() => toggleSort(field)}>
                { label }&nbsp;{
                    (query._sort === field) 
                        ? (query._direction > 0 ? <>↓</> : <>↑</>) 
                        : ""}
            </a>
        } else {
            return label;
        }
    }    
}

function TableBody({ path, headers, getField, items, selectedIds, setSelectedIds }:{
    path: string,
    headers: IQueryTableHeader[],
    getField?: (item: any, field: string) => JSX.Element | string,
    items: any[],
    selectedIds: string[],
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>,
}) {
    return <tbody>
        { items.map(item => {
            const selected = selectedIds.includes(item._id)
            return <tr 
                key={ item._id } 
                style={ selected ? {background: "lightgray" } : {}}>
                <td><input type="checkbox" checked={ selected } readOnly onClick={ () => onToggle(item) }/></td>
                { headers.map(({ field, enable_link }) => 
                    <td key={ field }>{ render(item, field, enable_link) }</td>
                    )}
                <td></td>
            </tr>})
        }
    </tbody>            

    function onToggle(item) {
        setSelectedIds(ids => {
            if (ids.includes(item._id)) {
                return ids.filter(id => id !== item._id);
            } else {
                return [...ids, item._id];
            }
        })
    }

    function render(item, field, enable_link) {
        const content = getField ? getField(item, field) : defaultGetField(item, field)
        if (enable_link) {
            return <Link to={ `${item._id}` }>{ content }</Link>
        } else {
            return content;
        }
    }
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