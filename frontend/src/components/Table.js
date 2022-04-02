'use strict';

import React, { useState } from 'react';

export function FilterInput(props) {
    return <div className="input form-group">
            <label htmlFor={props.name}>{ props.label }</label>
            <input className="form-control"
                name={props.name}
                onChange={props.onChange} />
        </div> 
}

export function FilterSelect(props) {
    return <div className="input form-group">
                <label htmlFor={props.name}>{props.label}</label>
                <select className="form-control" name={props.name} onChange={props.onChange}>
                    { props.children }
                </select>
            </div>

}

export function FilterButton({onChange, children}) {
    return <div className="dropdown mr-2">
    <button className="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
        <i className="fas fa-filter"></i>
        <span className="ml-2 d-none d-md-inline">Filtra</span>
    </button>
    <div className="dropdown-menu p-2" style={{width: "350px"}}>
        <form className="filterForm">
            { children.map((el,n) => {
                // inserisce la prop onChange in tutti i children
                return React.cloneElement(el, {key: el.key || n, onChange})
                }) }
        </form>
    </div>
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
                className={`my-1 btn ${props.className || "btn-success"}`} 
                style={{"width": "100%"}}
                onClick={ props.onClick }>
                    { props.children}
            </button>
}