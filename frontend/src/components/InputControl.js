'use strict';

import React from 'react';

class InputControl extends React.Component {
    render() {
        return <div className="input form-group">
            <label htmlFor={this.props.name}>{ this.props.label }</label>
            <input className="form-control"
                name={this.props.name}
                label={this.props.label}></input>
            </div> 
    }
}

export default InputControl;