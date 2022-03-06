'use strict';

import React from 'react';

class SelectControl extends React.Component {
    render() {
        return <div className="input form-group">
            <label htmlFor={this.props.name}>{ this.props.label }</label>
            <select className="form-control"
                name={this.props.name}
                label={this.props.label}>
                { Object.entries(this.props.options).map(
                    option => <option
                        key={option[0]}
                        name={option[0]}>
                        {option[1]}
                    </option>)}
            </select>
        </div>         
    }
}

export default SelectControl;