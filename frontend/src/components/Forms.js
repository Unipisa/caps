'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import FilterButton from './FilterButton';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';
import CapsPage from './CapsPage';

class Forms extends CapsPage {
    constructor(props) {
        super(props);
        this.state = {
            'forms': undefined,
            'selected': []
        };
        this.query = {};
        Object.assign(this.query, this.props.query);
        this.query.limit = 15;
    }
    
    async componentDidMount() {
        this.update(this.query);
    }

    addToSelection(form) {
        if (!this.state.forms || !this.state.forms.includes(form) || this.state.selected.includes(form)) {
            console.log("cannot select form");
            return;
        }
        this.setState({
            "selected": this.state.selected.concat([form]) 
        })
    }

    removeFromSelection(form) {
        if (!this.state.forms || !this.state.forms.includes(form) || !this.state.selected.includes(form)) {
            console.log("cannot deselect form");
            return;
        }
        this.setState({
            "selected": this.state.selected.filter(f => f!=form)
        });
    }

    async perform_action(action, selected) {
        if (!["approve", "reject", "redraft", "delete"].includes(action)) {
            console.log("ERROR: invalid action");
            return;
        }
        if (this.confirm("Confermi?", "Confermi l'azione scelta...?")) {
            // to be implemented...
        }
    }

    downloadCSV() {
        // to be implemented...
    }

    async update(query) {
        const forms = (await RestClient.get(`forms/`, query))['data'];
        this.setState({"forms": forms});
    }

    renderTailPanel() {
        return ;
    }

    renderTable() {
        if (this.state.forms === undefined) {
            return <LoadingMessage>Caricamento forms...</LoadingMessage>
        }
        else {
            return <div className="table-responsive-lg">
                <table className="table">
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
                    <tbody>
                    {this.state.forms.map(form => 
                        <FormRow 
                            key={form.id} 
                            form={form} 
                            Forms={this}
                            >
                        </FormRow>)}
                    </tbody>
                </table>
            </div>
        }
    }

    renderPage() {
        return <div>
                <h1>Moduli</h1>
                <Card>
                    <HeadPanel Forms={this}></HeadPanel>
                    { this.renderTable() }
                    { this.renderTailPanel() }
                </Card>
            </div>
    }
}

function ActionButton(props) {
    console.log(props.Forms)

    return <div className="dropdown">
    <button type="button" className="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Azioni
    </button>
    <div className="dropdown-menu p-2 shadow" style={{"width": "450px"}}>
        <button className="my-1 btn btn-success" style={{"width": "100%"}}
                onClick={() => props.Forms.perform_action('approve')}>
            ✓ Approva i moduli selezionati
        </button>
        <button className="my-1 btn btn-danger" style={{"width": "100%"}}
                onClick={() =>
                    confirm('Confermi di voler rifiutare i moduli selezionati?')
                    && props.Forms.perform_action('reject')}>
            ✗ Rifiuta i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() =>
                    confirm('Confermi di voler riportare in valutazione i moduli selezionati?')
                    && props.Forms.perform_action('resubmit')}>
            ⎌ Riporta in valutazione i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() =>
                    confirm('Confermi di voler riportare in bozza i moduli selezionati?')
                    && props.Forms.perform_action('redraft')}>
            ⎌ Riporta in bozza i moduli selezionati
        </button>
        <button className="my-1 btn btn-danger" style={{"width": "100%"}}
                onClick={() =>
                    confirm('Confermi di voler eliminare i moduli selezionati?')
                    && props.Forms.perform_action('delete')}> 
            🗑 Elimina i moduli selezionati
        </button>
    </div>
</div>
}

function HeadPanel(props) {
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
        <ActionButton Forms={props.Forms} />

        <div className="flex-fill"></div>

        <div className="col-auto">
            <button type="button" className="btn btn-sm btn-primary" onClick={() => Forms.downloadCSV()}>
                <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">Esporta in CSV</span>
            </button>
        </div>
        </div>;
}

function FormRow(props) {
    const selected = props.Forms.state.selected.includes(props.form);
    const form = props.form;
    return <tr>
        <td>
            { selected 
                ? <input type="checkbox" checked="checked" onClick={() => props.Forms.removeFromSelection(form)}/>
                : <input type="checkbox" onClick={() => props.Forms.addToSelection(form)}/>
            }
        </td>
        <td><FormBadge form={form}></FormBadge></td>
        <td>{form.user.givenname+" "+form.user.surname}</td>
        <td>{form.form_template.name}</td>
        <td>{form.date_submitted}</td>
        <td>{form.date_managed}</td>
        <td>
            <div className="d-none d-xl-inline-flex flex-row align-items-center">
                <a href={`${props.Forms.props.root}forms/view/${form.id}`}>
                    <button type="button" className="btn btn-sm btn-primary mr-2">
                    <i className="fas fa-eye mr-2"></i>
                    Visualizza
                    </button>
                </a>
            </div>
        </td>
    </tr>
}

export default Forms;
