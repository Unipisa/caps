'use strict';

import React, { useState } from 'react';

class FilterButton extends React.Component {
    render() {
        return <div className="dropdown mr-2">
                    <button className="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
                        <i className="fas fa-filter"></i>
                        <span className="ml-2 d-none d-md-inline">Filtra</span>
                    </button>
                    <div className="dropdown-menu p-2" style={{width: "350px"}}>
                        { this.props.children }
                    </div>
                </div>
    }
}

export default FilterButton;
