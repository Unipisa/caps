'use strict';

import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { CSVDownload, CSVLink } from 'react-csv';

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

export function FilterInput({name, label, value, onChange}) {
    
    const [ my_value, setValue ] = useState(value);

    function onKeyDown(e) {
        if (e.key == 'Enter') {
            onChange(e);
        }
    }

    return <div className="input form-group">
            <label htmlFor={name}>{ label }</label>
            <input className="form-control"
                name={name}
                value={my_value}
                placeholder={label}
                onChange={e => {setValue(e.target.value)}}
                onBlur={onChange} 
                onKeyDown={onKeyDown}/>
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

export function FilterButton({onChange, children }) {
    const [open, setOpen ] = useState(false);
    function onItemChange(e) {
        setOpen(false);
        onChange(e);
    }
    // onClick={ () => setOpen(!open)
    return <Dropdown className="mr-2" show={ open }>
                <Dropdown.Toggle className="btn-sm" variant="primary" onClick={ () => setOpen(!open) }>
                    <i className="fas fa-filter"></i>
                    <span className="ml-2 d-none d-md-inline">Filtra</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="p-2" style={{width: "350px", margin: 0}}>
                    { children.map((el,n) => {
                        // inserisce la prop onChange in tutti i children
                        return React.cloneElement(el, {key: el.key || n, "onChange": onItemChange})
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

export function CsvDownloadButton({ onClick, csvData, filename }) {
    return <>
        <button type="button" className="btn btn-sm btn-primary" onClick={ onClick }>
                <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">CSV</span>
        </button>
        { csvData !== null 
            ? <CSVDownload 
                data={ csvData.data }
                headers={ csvData.headers }
                filename={ filename }
                target="_blank" /> 
            : null }
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

export function FilterBadges({query, onRemoveField}) {
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

export function TableContainer({ children }) {
    return <div className="table-responsive-lg">
        { children }
    </div>
}

export function Table({ children }) {
    return <table className="table">
        { children }
    </table>
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
            { children.map(button => React.cloneElement(button, { xl: true })) }
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