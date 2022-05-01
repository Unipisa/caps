'use strict';

import React from 'react';

class Items extends React.Component {
    constructor(Model, props) {
        super(props);

        this.Model = Model;

        this.state = {
            query: {_limit: 10},
            csvData: null,
            data: null,
        };

        this.Page = props.Page;

        this.load();
    }

    toggleSort(name) {
        if ( this.state.query._sort === name) {
            let _direction = null;
            if (this.state.query._direction === 1) _direction = -1;
            else if (this.state.query._direction === -1) _direction = 1;
            else throw new RangeError(`invalid value for _direction: ${ this.state.query._direction }`);
            const query = { ...this.state.query, _direction};
            this.setState({ query }, () => this.load());
        } else {
            const _sort = name;
            const _direction = 1;
            const query = {...this.state.query, _sort, _direction};
            this.setState({ query }, () => this.load());
        }
    }

}

export default Items;
