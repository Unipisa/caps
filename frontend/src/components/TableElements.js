'use strict';

import React, { useState, Children } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { CSVDownload, CSVLink } from 'react-csv'

import { useQuery } from './QueryTable'
import { useEngine } from '../modules/engine'

export function ItemAddButton({ to, children }) {
    const navigate = useNavigate()

    return <button type="button" 
        className="btn btn-sm btn-primary mr-2"
        onClick={() => navigate(to)}
    >
        <i className="fas fa-plus"></i>
        <span className="d-none d-md-inline ml-2">
            { children }
        </span>
    </button>
}

export function FilterInput({ name, label }) {
    const { query, setQuery } = useQuery()
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

export function FilterSelect({name, label, value, onChange, children}) {
    return <div className="input form-group">
                <label htmlFor={name}>{label}</label>
                <select className="form-control" name={name} value={value} onChange={onChange}>
                    { children }
                </select>
            </div>
}

export function FilterCheckbox({name, label, value, onChange }) {
    return <div className="input form-group">
        <label htmlFor={name}>{label}</label>
        <input type="checkbox" className="form-control" name={name} value={value} onChange={onChange}/>
    </div>
}

export function FilterButton({ children }) {
    const engine = useEngine()
    const { query, setQuery } = useQuery()
    const [open, setOpen ] = useState(false);
    return <Dropdown className="mr-2" show={ open }>
        <Dropdown.Toggle className="btn-sm" variant="primary" onClick={ () => setOpen(!open) }>
            <i className="fas fa-filter"></i>
            <span className="ml-2 d-none d-md-inline">Filtra</span>
        </Dropdown.Toggle>
        <Dropdown.Menu className="p-2" style={{width: "350px", margin: 0}}>
            { Children.map(children, (el, n) => {
                // inserisce la prop onChange in tutti i children
                return React.cloneElement(el, {
                    engine,
                    query,
                    setQuery,
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

export function TableTopRightButtons({ children }) {
    return <>
        <div className="flex-fill" />
        <div className="col-auto">
            { children }
        </div>
    </>
}

export function CsvDownloadButton({ Model }) {
    const { query } = useQuery()
    const [ csvData, setCsvData ] = useState(null);

    async function onClick() {
        setCsvData(await Model.csvData(query));
    }

    return <>
        <button type="button" className="btn btn-sm btn-primary mr-2" onClick={ onClick }>
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
    return <button type="button" className="btn btn-sm btn-primary mr-2">
        <i className="fas fw fa-file-excel" />
        <span className="ml-2 d-none d-md-inline">
           <span className="d-none d-xl-inline">Esporta in</span> Excel
        </span>
    </button>
}

export function ActionButtons({children}) {
    return <div className="dropdown">
                <button type="button" className="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
                        data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    Azioni
                </button>
                <div className="dropdown-menu p-2 shadow" style={{"width": "450px"}}>
                    { children }
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

