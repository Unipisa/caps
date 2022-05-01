'use strict';

import React, { useState, useEffect } from 'react';
import api from '../modules/api';
import LoadingMessage from './LoadingMessage';
import { QueryContext } from './TableElements';

export default function QueryTable({ flashCatch, Model, children }) {
    const [ query, setQuery ] = useState({});
    const [ limit, setLimit ] = useState(10);
    const [ sort, setSort ] = useState(Model.sort_default);
    const [ direction, setDirection ] = useState(Model.sort_default_direction);
    const [ data, setData ] = useState(null);

    useEffect(async () => {
        try {
            const new_data = await api.get(
                `${Model.api_url}`, 
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
            flashCatch(err);
        }    
    }, [ sort, direction, limit ]);

    function toggleSort(field) {
        if ( sort === field) {
            setDirection(-direction);
        } else {
            setSort(field);
            setDirection(1);
        }
    }

    return <QueryContext.Provider value={ { query, setQuery } }>
        <div className="d-flex mb-2">
            { children }
        </div>
        <FilterBadges query={ query } setQuery={ setQuery } />
        <div className="table-responsive-lg">
        <table className="table">
            <thead>
                <tr>
                    <th></th>
                    { Model.table_headers.map( field => 
                        <th key={ field }> 
                            <a href="#" onClick={() => toggleSort(field)}>
                            { Model.verbose[field] }&nbsp;{
                                (sort == field) 
                                    ? (direction > 0 ? <>↑</> : <>↓</>) 
                                    : ""}
                            </a>
                        </th> 
                    )}
                </tr>
            </thead>        
            <TableBody Model={ Model } data={ data } setData={ setData } />
        </table>
        <MoreLinesButton data={ data } onClick={ () => setLimit(limit+10) } />
    </div>
    </QueryContext.Provider>
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

function TableBody({ Model, data, setData }) {
    if ( data === null ) {
        return <tbody>
            <tr><td colSpan="4"><LoadingMessage>Caricamento esami...</LoadingMessage></td></tr>
        </tbody>
    } else {
        return <tbody>
            { data.items.map(item =>
            <ItemRow 
                key={ item._id } 
                item={ item } 
                data={ data }
                setData= { setData }>
                    {Model.table_headers.map(field => 
                    <td key={field}><a href={ new Model(item).view_url() }>
                    { item[field] }</a></td>)}
            </ItemRow>)
            }
        </tbody>            
    }
}

function ItemRow({ item, data, setData, children }) {
    function onToggle() {
        const items = data.items.map(it => {
            return it._id === item._id
            ? {...it, _selected: !it._selected}
            : it;});
        setData({...data, items });
    }

    return <tr style={ item._selected ? {background: "lightgray" } : {}}>
    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ onToggle }/></td>
    { children }
    <td></td>
</tr>
}

function MoreLinesButton({ data, onClick }) {
    if (data) {
        return <p>
        { data.items.length < data.total 
        ? <button className="btn btn-primary mx-auto d-block" onClick={ onClick } >
            Carica più righe (altri {`${ data.total - data.items.length} / ${ data.total }`} da mostrare)
        </button>
        : null
        }
        </p>
    } else {
        return null;
    }
}
