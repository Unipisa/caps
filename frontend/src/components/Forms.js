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

    freezeSelected() {
        return this.setStateAsync({
            "selected": this.state.selected.map(form => {form.frozen = true; return form;}) 
        });
    }

    /** 
     * patch is a dictionary of key:vals which is sent 
     * with a POST method to all selected objects
     */
    async update_form(form, patch) {
        let res = await RestClient.patch(`/form/${form.id}`, patch);
        if (res.code == 200) {
            let forms = this.state.forms.map(f => {f==form?res.data:f});
            let selected = this.state.forms.map(f => {f==form?res.data:f});
            this.setState({forms, selected});
        } else {
            console.log(res.message);
            /* flash error message */
        }
    }

    async delete_form(form) {
        let res = await RestClient.delete(`/form/${form.id}`);
        if (res.code == 200) {
            /* flash confirmed message ? */
            let selected = this.state.selected.filter(f => (f != form));
            let forms = this.state.selected.filter(f => (f != form));
            await this.setStateAsync({
                "selected": selected,
                "forms": forms
            });
        } else {
            console.log(res.message);
            /* flash error message ? */
        }
    }

    async perform_action(action) {
        let selected = this.state.selected;
        await this.freezeSelected();
        if (action === "approve") {
            if (await this.confirm("Confermi approvazione?", `Vuoi approvare ${selected.length} modulo/i selezionati?`)) {
                await this.update_selected({"state": "approved"});
            }
        } else if (action == "reject") {
            if (await this.confirm("Confermi rifiuto?", `Vuoi rifiutare ${selected.length} modulo/i selezionati?`)) {
                await this.update_selected({"state": "rejected"});
            }
        } else if (action == "resubmit") {
            if (await this.confirm("Riporta in valutazione?", `Vuoi risottomettere ${selected.length} modulo/i selezionati?`)) {
                await this.update_selected({"state": "submitted"});     
            }
        } else if (action == "redraft") {
            if (await this.confirm("Riporta in bozza?", `Vuoi riportare in bozza ${selected.length} modulo/i selezionati?`)) {
                await this.update_selected({"state": "draft"});
            }
        } else if (action == "delete") {
            if (await this.confirm("Confermi cancellazione?", `Vuoi rimuovere ${selected.length} modulo/i selezionati?`)) {
                await this.delete_selected();
            }
        }  else {
            console.log("ERROR: invalid action");
        }
        selected = this.state.selected.map(form => {form.frozen = undefined; return form;});
        this.setState({selected});
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
                onClick={() => props.Forms.perform_action('reject')}>
            ✗ Rifiuta i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() => props.Forms.perform_action('resubmit')}>
            ⎌ Riporta in valutazione i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() => props.Forms.perform_action('redraft')}>
            ⎌ Riporta in bozza i moduli selezionati
        </button>
        <button className="my-1 btn btn-danger" style={{"width": "100%"}}
                onClick={() => props.Forms.perform_action('delete')}> 
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
    return <tr style={form.frozen?{background: "gray"}:{}}>
        <td><input type="checkbox" defaultChecked={ selected } onClick={() => selected ? props.Forms.removeFromSelection(form) : props.Forms.addToSelection(form)}/></td>
        <td><FormBadge form={form}></FormBadge></td>
        <td>{form.user.name}</td>
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
