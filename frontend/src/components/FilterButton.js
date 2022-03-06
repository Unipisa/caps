'use strict';

import React, { useState } from 'react';
import SelectControl from './SelectControl';
import InputControl from './InputControl';
import RestClient from '../modules/api.js';

class FilterButton extends React.Component {
    constructor(props){
        super(props);
        this.form = React.createRef();
        this.items = Object.entries(this.props.items).map(
            pair => this.map_item(pair[0], pair[1])
            );
        this.filters = {};
    }

    onChange(event) {
        this.filters[event.target.name] = event.target.value;
        if (this.props.callback !== undefined) {
            this.props.callback(this);
        }
    }

    map_item(name, item) {
        if (typeof item === "string" || item instanceof String) {
            item = {"label": item}
        }
        if (item.name === undefined) item.name = name;
        if (item.key === undefined) item.key = item.name;
        if (item.onChange === undefined) item.onChange = this.onChange.bind(this)
        if (item.type == "select") {
            return React.createElement(SelectControl, item);
        } else {
            return React.createElement(InputControl, item);
        }
    }

    render() {
        return <div className="dropdown mr-2">
                    <button className="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i className="fas fa-filter"></i>
                        <span className="ml-2 d-none d-md-inline">Filtra</span>
                    </button>
                    <div className="dropdown-menu p-2" style={{width: "350px"}}>
                        <form ref={this.form} className="filterForm" method="GET">
                        { this.items }
                        </form>
                    </div>
                </div>
    }
}

export default FilterButton;
