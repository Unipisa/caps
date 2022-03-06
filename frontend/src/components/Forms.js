'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import LoadingMessage from './LoadingMessage';
import FormsBlock from './FormsBlock';

class Forms extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'forms': undefined
        };

        this.load();
    }

    async load() {
        let forms = this.state.forms;
        if (forms === undefined) {
            forms = (await RestClient.get(`forms/`))['data'];
            this.setState({"forms": forms});
        }
    }

    onDeleteClicked(f) {
    }


    render() {
        return <Card>
            <FormsBlock
                forms={this.state.forms}
                root={this.props.root}
            ></FormsBlock>
            </Card>;
    }
}

export default Forms;
