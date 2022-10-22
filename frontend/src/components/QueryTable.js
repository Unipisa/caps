'use strict';

import React, { useState, useEffect, createContext, useContext } from 'react'

import { useEngine } from '../modules/engine'
import api from '../modules/api'
import { Link } from "react-router-dom"
import LoadingMessage from './LoadingMessage'


export const QueryTableContext = createContext(null)

export const QueryTableProvider = QueryTableContext.Provider
  
export function useQuery() {
    return useContext(QueryTableContext)
}

export default function QueryTable({ Model, children }) {
    const [ query, setQuery ] = useState({})

    return <QueryTableProvider value={{query, setQuery}}>
        <div className="d-flex mb-2">
            {children}
        </div>
        <FilterBadges/>
        <div className="table-responsive-lg">
            <Table Model={ Model }/>
        </div>
    </QueryTableProvider>
}

function FilterBadges() {
    const { query, setQuery } = useQuery()
    function onRemoveField(field) {
        let new_query = {...query};
        delete new_query[field];
        setQuery(new_query);
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
    const engine = useEngine()
    const { query } = useQuery()
    const [ limit, setLimit ] = useState(10)
    const [ sort, setSort ] = useState(Model.sort_default)
    const [ direction, setDirection ] = useState(Model.sort_default_direction)
    const [ data, setData ] = useState(null)
    const indexQuery = engine.useIndex(Model, query)

    if (data===null && indexQuery.isSuccess) {
        indexQuery.data.items.forEach(item => {item._selected=false})
        setData(indexQuery.data)
    }

    function toggleSort(field) {
        if ( sort === field) {
            setDirection(-direction);
        } else {
            setSort(field);
            setDirection(1);
        }
    }

    function Header({ field, label, enable_sort }) {
        if (enable_sort) {
            return <a href="#" onClick={() => toggleSort(field)}>
                { label }&nbsp;{
                    (sort == field) 
                        ? (direction > 0 ? <>↓</> : <>↑</>) 
                        : ""}
            </a>
        } else {
            return label;
        }
    }

    return <>
    {data && `${data.items.length}/${data.total} elementi mostrati`}
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
        <TableBody Model={ Model } data={ data } setData={ setData } />
    </table>
    {data && <p>
        { data.items.length < data.total 
        ? <button className="btn btn-primary mx-auto d-block" onClick={ () => setLimit(limit + 10) } >
            Carica più righe (altri {`${ data.total - data.items.length} / ${ data.total }`} da mostrare)
        </button>
        : null
        }
    </p>
    }
    </>
}

function TableBody({ Model, data, setData }) {
    const [cache, setCache] = useState([{}]);

    function onToggle(item) {
        const items = data.items.map(it => {
            return it._id === item._id
            ? {...it, _selected: !it._selected}
            : it;});
        setData({...data, items });
    }

    function renderField(item, field, enable_link) {
        const content = item.render_table_field(field);
        if (enable_link) {
            return <Link to={ item.view_url() }>{ content }</Link>
        } else {
            return content;
        }
    }

    if ( data === null ) {
        return <tbody>
            <tr><td colSpan="4"><LoadingMessage>Caricamento esami...</LoadingMessage></td></tr>
        </tbody>
    } else {
        return <tbody>
            { data.items.map(item => {
                item.load_related(cache, setCache)
                return <tr key={ item._id } style={ item._selected ? {background: "lightgray" } : {}}>
                    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ () => onToggle(item) }/></td>
                    { Model.table_headers.map(({ field, enable_link }) => 
                        <td key={ field }>{ renderField(item, field, enable_link) }</td>
                        )}
                    <td></td>
                </tr>})
            }
        </tbody>            
    }
}
