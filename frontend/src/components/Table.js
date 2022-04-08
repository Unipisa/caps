'use strict';

import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

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

export function ActionButton(props) {
    return <button 
                className={`my-1 btn ${props.className || "btn-primary"}`} 
                style={{"width": "100%"}}
                onClick={ props.onClick }>
                    { props.children}
            </button>
}