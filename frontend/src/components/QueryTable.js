'use strict';

import React, { useState, useEffect } from 'react'

import api from '../modules/api'
import { Link } from "react-router-dom"
import LoadingMessage from './LoadingMessage'

export default function QueryTable({ engine, Model, children }) {
    const [ query, setQuery ] = useState({});

    return <>
        <div className="d-flex mb-2">
        { React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, { engine, query, setQuery })
            }
            return child;
        })}
        </div>
        <FilterBadges query={ query } setQuery={ setQuery } />
        <div className="table-responsive-lg">
            <Table
                engine={ engine } 
                query={ query }
                Model={ Model }
                />
        </div>
    </>
}

function FilterBadges({ query, setQuery }) {
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

function Table({ engine, Model, query }) {
    const [ limit, setLimit ] = useState(10);
    const [ sort, setSort ] = useState(Model.sort_default);
    const [ direction, setDirection ] = useState(Model.sort_default_direction);
    const [ data, setData ] = useState(null);

    function toggleSort(field) {
        if ( sort === field) {
            setDirection(-direction);
        } else {
            setSort(field);
            setDirection(1);
        }
    }

    useEffect(async () => {
        try {
            const new_data = await api.get(
                `${ Model.api_url }`, 
                {...query, 
                    _sort: sort,
                    _direction: direction,
                    _limit: limit});
            new_data.items = new_data.items.map(item => {
                return {
                    ...item, 
                    _selected: false
                }
            });
            setData(new_data);
        } catch(err) {
            engine.flashCatch(err);
        }    
    }, [ sort, direction, limit, query ]);

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

    function renderField(model_item, field, enable_link) {
        const content = model_item.render_table_field(field);
        if (enable_link) {
            return <Link to={ model_item.view_url() }>{ content }</Link>
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
                const model_item = new Model(item);
                model_item.load_related(cache, setCache);
                return <tr key={ item._id } style={ item._selected ? {background: "lightgray" } : {}}>
                    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ () => onToggle(item) }/></td>
                    { Model.table_headers.map(({ field, enable_link }) => 
                        <td key={ field }>{ renderField(model_item, field, enable_link) }</td>
                        )}
                    <td></td>
                </tr>})
            }
        </tbody>            
    }
}