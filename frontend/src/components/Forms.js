'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import FilterButton from './FilterButton';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';

class Forms extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'forms': undefined
        };
        this.update(this.props.query || {});
    }

    async update(query) {
        const forms = (await RestClient.get(`forms/`, query))['data'];
        this.setState({"forms": forms});
    }

    async update_query() {

    }

    onDeleteClicked(f) {
    }

    renderHeadPanel() {
        return <div className="d-flex mb-2">
            <FilterButton                   
                items={{
                    state: {
                        label: "stato",
                        type: "select",
                        options: {
                            '': 'tutti',
                            'draft': 'bozze',
                            'submitted': 'da valutare',
                            'approved': 'approvati',
                            'rejected': 'rifiutati'
                        }
                    },
                    surname: "cognome",
                    formTemplate: "modello",
                    name: "nome"
                }}
                callback={filter_button => this.update(filter_button.filter)}>
            </FilterButton>
        </div>;
    }

    renderTailPanel() {
        return ;
    }

    renderTable() {
        if (this.state.forms === undefined) {
            return <LoadingMessage>Caricamento forms...</LoadingMessage>
        }
        else {
            return <div class="table-responsive-lg">
                <table class="table">
                    <thead>
                        <tr>
                        <th></th>
                        <th><a href="#">Stato</a></th>
                        <th>Nome</th>
                        <th>Modello</th>
                        <th>Inviato</th>
                        <th>Gestito</th>
                        <th></th>
                        </tr>
                    </thead>
                    {this.state.forms.map(form => <tr key={form.id}>
                        <td><input type="checkbox" value={form.id}></input></td>
                        <td><FormBadge form={form}></FormBadge></td>
                        <td>{form.user.firstname+" "+form.user.surname}</td>
                        <td>{form.form_template.name}</td>
                        <td>{form.date_submitted}</td>
                        <td>{form.date_managed}</td>
                    </tr>)}
                </table>
            </div>
        }
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
