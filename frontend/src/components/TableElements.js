'use strict';

import React, { useState, useEffect, Children } from 'react';
import { Dropdown } from 'react-bootstrap';
import { CSVDownload, CSVLink } from 'react-csv';
import api from '../modules/api';
import LoadingMessage from './LoadingMessage';

export function TableTopButtons({ children }) {
    return <div className="d-flex mb-2">
        { children }
    </div>
} 

export function ItemAddButton({ children }) {
    return <button type="button" className="btn btn-sm btn-primary mr-2">
        <i className="fas fa-plus"></i>
        <span className="d-none d-md-inline ml-2">
            { children }
        </span>
    </button>
}

export const QueryContext = React.createContext({ 
    query: {}, 
    setQuery: () => null
});

export function FilterInput({ name, label }) {
    function Internal({ query, setQuery }) {
        const [ my_value, setValue ] = useState(query[name] || "");

        function onChange(e) {
            setQuery({...query, [name]: my_value })
        }

        return <div className="input form-group">
                <label htmlFor={name}>{ label }</label>
                <input className="form-control"
                    name={name}
                    value={my_value}
                    placeholder={label}
                    onChange={e => { setValue(e.target.value) }}
                    onBlur={onChange} 
                    onKeyDown={ e => {
                            if (e.key == 'Enter') {
                                onChange(e);
                            }
                        }}/>
            </div> 
    }

    return <QueryContext.Consumer>
        { 
        ({ query, setQuery }) =>
        <Internal query={ query } setQuery={ setQuery } />
    }
    </QueryContext.Consumer>
}

export function FilterSelect({name, label, value, onChange, children}) {
    return <div className="input form-group">
                <label htmlFor={name}>{label}</label>
                <select className="form-control" name={name} value={value} onChange={onChange}>
                    { children }
                </select>
            </div>

}

export function FilterButton({ children }) {
    const [open, setOpen ] = useState(false);
    return <QueryContext.Consumer>
        { ({ query, setQuery }) => 
            <Dropdown className="mr-2" show={ open }>
                <Dropdown.Toggle className="btn-sm" variant="primary" onClick={ () => setOpen(!open) }>
                    <i className="fas fa-filter"></i>
                    <span className="ml-2 d-none d-md-inline">Filtra</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2" style={{width: "350px", margin: 0}}>
                    { Children.map(children, (el, n) => {
                        // inserisce la prop onChange in tutti i children
                        return React.cloneElement(el, {
                            key: el.key || n, 
                            onChange: (e) => { 
                                setOpen(false);
                                let new_query = {...query};
                                if (e.target.value === '') {
                                    delete query[e.target.name];
                                } else {
                                    query[e.target.name] = e.target.value;
                                }
                                setQuery(new_query);
                            }
                        })
                    }) }
                </Dropdown.Menu>
            </Dropdown>
        }
    </QueryContext.Consumer>
}

export function TableTopRightButtons({ children }) {
    return <>
        <div className="flex-fill" />
        <div className="col-auto">
            { children }
        </div>
    </>
}

export function CsvDownloadButton({ Model, query }) {
    const [ csvData, setCsvData ] = useState(null);

    async function onClick() {
        setCsvData(await Model.csvData(query));
    }

    return <>
        <button type="button" className="btn btn-sm btn-primary" onClick={ onClick }>
                <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">CSV</span>
        </button>
        { csvData &&
            <CSVDownload 
                data={ csvData.data }
                headers={ csvData.headers }
                filename={ csvData.filename }
                target="_blank" /> 
        }
    </>
}

export function ExcelDownloadButton() {
    return <button type="button" className="btn btn-sm btn-primary">
        <i className="fas fw fa-file-excel" />
        <span className="ml-2 d-none d-md-inline">
           <span className="d-none d-xl-inline">Esporta in</span> Excel
        </span>
    </button>
}

export function FilterBadges({ query, setQuery }) {
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

export function ColumnHeaders({ children }) {
    return <thead>
        <tr>
            <th></th>
            { children }
            <th></th>
        </tr>
    </thead>
}

export function ColumnHeader({self, name, children}) {
    if (self) {
        let direction = 0;
        if (self.state.query._sort == name) {
            direction = self.state.query._direction;
        }

        return <th>
            <a href="#" onClick={() => self.toggleSort(name)}>
            { children }&nbsp;{direction ? (direction > 0 ? <>↑</> : <>↓</>) : ""}
            </a>
        </th>
    } else {
        return <th>
            { children }
        </th>
    }
}

export function ActionButtons(props) {
    return <div className="dropdown">
                <button type="button" className="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Azioni
                </button>
                <div className="dropdown-menu p-2 shadow" style={{"width": "450px"}}>
                    { props.children }
                </div>
            </div>
}

export function ActionButton({ className, onClick, children }) {
    return <button 
                className={`my-1 btn ${className || "btn-primary"}`} 
                style={{"width": "100%"}}
                onClick={ onClick }>
                    { children }
            </button>
}

export function QueryTable({ flashCatch, Model, children }) {
    const [query, setQuery] = useState({});
    return <QueryContext.Provider value={ { query, setQuery } }>
        <p>query: { JSON.stringify(query) }</p>
        <TableTopButtons>
            { children }
        </TableTopButtons>
        <FilterBadges query={ query } setQuery={ setQuery } />
        <TableContainer flashCatch={ flashCatch } Model={ Model } >
            { Model.table_headers.map( field => 
                    <ColumnHeader key={ field } name={ field }>
                        { Model.verbose[field] }
                    </ColumnHeader> 
                ) }
        </TableContainer>    
    </QueryContext.Provider>
}

export function Table({ children }) {
    return <table className="table">
        { children }
    </table>
}

export function TableBody({ Model, data, setData }) {
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

export function TableContainer({ flashCatch, Model, query, children }) {
    const [data, setData] = useState(null);
    const [limit, setLimit] = useState(10);

    useEffect(async () => {
        try {
            const new_data = await api.get(
                `${Model.api_url}`, 
                {...query, _limit: limit});
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
    }, [ limit ]);

    return <div className="table-responsive-lg">
        <Table>
            <ColumnHeaders>
                { children }
            </ColumnHeaders>
            <TableBody Model={ Model } data={ data } setData={ setData } />
        </Table>
        <MoreLinesButton data={ data } onClick={ () => setLimit(limit+10) } />
    </div>
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
</tr>
}

export function ResponsiveButton({className, href, children, xl}) {
    if (xl) return <a href={ href }>
        <button type="button" className={"btn btn-sm mr-2 "+className}>
            { children }
        </button>
    </a>
    else return <li>
        <a className="dropdown-item" href={ href }>
            { children }
        </a>
    </li>
}

export function ResponsiveButtons({children}) {
    return <>
        <div className="d-xl-none">
            <div className="dropdown">
                <a className="btn-sm btn-secondary dropdown-toggle" href="#" role="button"
                id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <i className="fas fa-cog" />
                </a>
                <ul className="dropdown-menu">
                    { children }
                </ul>
            </div>
        </div>
        <div className="d-none d-xl-inline-flex flex-row align-items-center">
            { Children.map(children, button => React.cloneElement(button, { xl: true })) }
        </div>
    </>
}

export function MoreLinesButton({ data, onClick }) {
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

