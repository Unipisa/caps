import React, { useState, Children } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dropdown } from 'react-bootstrap'
import { CSVDownload, CSVLink } from 'react-csv'

import { useQuery } from './QueryTable'
import { useEngine } from '../modules/engine'

export function ItemAddButton({ to, children }:{
    to?: string,
    children?: any,
}) {
    const navigate = useNavigate()

    return <button type="button" 
        className="btn btn-sm btn-primary mr-2"
        onClick={() => to ? navigate(to) : navigate('edit/__new__')}
    >
        <i className="fas fa-plus"></i>
        <span className="d-none d-md-inline ml-2">
            { children }
        </span>
    </button>
}

export function FilterInput({ name, label }) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx 
    const [ myValue, setValue ] = useState(query[name] || "")

    function onChange(e) {
        setQuery({...query, [name]: myValue })
    }

    return <div className="input form-group">
            <label htmlFor={name}>{ label }</label>
            <input className="form-control"
                name={name}
                value={myValue}
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

export function FilterSelect({name, label, value, children}:{
    name: string,
    label: string,
    value?: string,
    children?: any,
}) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx 
    const myValue = query[name] || ""

    function onChange(e) {
        setQuery(query => ({...query, [name]: myValue }))
    }

    return <div className="input form-group">
                <label htmlFor={name}>{label}</label>
                <select className="form-control" name={name} value={myValue} onChange={onChange}>
                    { children }
                </select>
            </div>
}

export function FilterCheckbox({name, label}) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx
    const [ checked, setChecked ] = useState(query[name] || false);
    return <div className="input form-group">
        <label htmlFor={name}>{label}</label>
        <input type="checkbox" className="form-control" name={name} checked={checked} 
            onChange={() => {
                setChecked(!checked);
                setQuery({...query, [name]: !checked })
            }}/>
    </div>
}

export function FilterButton({ children }) {
    const engine = useEngine()
    const ctx = useQuery()
    if (!ctx) return null
    const { query, setQuery } = ctx
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

export function CsvDownloadButton({ cb }: {
    cb: (IQuery) => Promise<any>
}) {
    const ctx = useQuery()
    if (!ctx) return null
    const { query } = ctx 
    const [ csvData, setCsvData ] = useState<any>(null)

    async function onClick() {
        setCsvData(await cb(query))
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

