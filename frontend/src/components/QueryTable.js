'use strict';

import React, { useState, createContext, useContext } from 'react'

import { useEngine, useIndex } from '../modules/engine'
import { Link } from "react-router-dom"
import LoadingMessage from './LoadingMessage'
import Card from 'react-bootstrap/Card'

export const QueryTableContext = createContext(null)

export const QueryTableProvider = QueryTableContext.Provider
  
export function useQuery() {
    return useContext(QueryTableContext)
}

export default function QueryTable({ Model, children }) {
    const [ query, setQuery ] = useState({
        _limit: 10,
        _sort: Model.sort_default,
        _direction: Model.sort_default_direction,
    })

    return <Card className="shadow my-2">
        <Card.Body>
            <QueryTableProvider value={{query, setQuery}}>
                <div className="d-flex mb-2">
                    {children}
                </div>
                <FilterBadges/>
                <div className="table-responsive-lg">
                    <Table Model={ Model }/>
                </div>
            </QueryTableProvider>
        </Card.Body>
    </Card>
}

function FilterBadges() {
    const { query, setQuery } = useQuery()
    function onRemoveField(field) {
        setQuery(q => {
            let { [field]: _, ...rest } = q;
            return rest;
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

function Table({ Model }) {
    const { query, setQuery } = useQuery()
    const indexQuery = useIndex(Model, query)
    const [ selectedIds, setSelectedIds ] = useState([])
    
    if (indexQuery.isError) return <>ERRORE</>
    if (indexQuery.isLoading) return <LoadingMessage/>

    const data = indexQuery.data
    const items = data.items.map(item => new Model(item))

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

    return <>
    {items.length}/{data.total} elementi mostrati
    <table className="table">
        <thead>
            <tr>
                <th></th>
                { Model.table_headers.map( ({ field, label, enable_sort }) => 
                    <th key={ field }> 
                        <Header field={ field } label={ label } enable_sort={ enable_sort } />
                    </th> 
                )}
            </tr>
        </thead>        
        <TableBody Model={ Model } items={ items } selectedIds={ selectedIds } setSelectedIds={ setSelectedIds } />
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
}

function TableBody({ Model, items, selectedIds, setSelectedIds }) {
    const [cache, setCache] = useState([{}])

    function onToggle(item) {
        setSelectedIds(ids => {
            if (ids.includes(item._id)) {
                return ids.filter(id => id !== item._id);
            } else {
                return [...ids, item._id];
            }
        })
    }

    function renderField(item, field, enable_link) {
        const content = item.render_table_field(field);
        if (enable_link) {
            return <Link to={ item.view_url() }>{ content }</Link>
        } else {
            return content;
        }
    }

    return <tbody>
        { items.map(item => {
            const selected = selectedIds.includes(item._id);
            item.load_related(cache, setCache)
            return <tr 
                key={ item._id } 
                style={ selected ? {background: "lightgray" } : {}}>
                <td><input type="checkbox" checked={ selected } readOnly onClick={ () => onToggle(item) }/></td>
                { Model.table_headers.map(({ field, enable_link }) => 
                    <td key={ field }>{ renderField(item, field, enable_link) }</td>
                    )}
                <td></td>
            </tr>})
        }
    </tbody>            
}
