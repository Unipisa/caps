'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import InputControl from './InputControl';
import SelectControl from './SelectControl';
import FilterButton from './FilterButton';

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

    renderHeadPanel() {
        return <div className="d-flex mb-2">
            <FilterButton>                    
                <SelectControl
                    name="state"
                    label="stato"
                    type="select"
                    options={{
                        '': 'tutti',
                        'draft': 'bozze',
                        'submitted': 'da valutare',
                        'approved': 'approvati',
                        'rejected': 'rifiutati'
                    }}>
                </SelectControl>
                <InputControl
                    name="surname"
                    label="cognome">
                </InputControl>
                <InputControl
                    name="formTemplate"
                    label="modello">
                </InputControl>
                <InputControl
                    name="name"
                    label="nome">
                </InputControl>
            </FilterButton>
        </div>;
    }

    renderTailPanel() {
        return ;
    }

    renderTable() {
        return ;
    }

    render() {
        return <div>
            <h1>Moduli</h1>
            <Card>
                { this.renderHeadPanel() }
                { this.renderTable() }
                { this.renderTailPanel() }
            </Card>
        </div>
    }
}

export default Forms;
