'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import FilterButton from './FilterButton';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';
import CapsPage from './CapsPage';
import { CSVDownload, CSVLink } from "react-csv";

class Forms extends CapsPage {
    constructor(props) {
        super(props);
        this.state = {
            'rows': undefined
        };
        // query with filters and sorting keys, no limits
        this.query = {...this.props.query};
    }
    
    async componentDidMount() {
        this.load();
    }

    async load() {
        const limit = 15;
        const forms = (await RestClient.get(`forms/`, {...this.query, limit}))['data'];
        const rows = forms.map(form => {return {
            form,
            selected: false
        }})
        await this.setStateAsync({rows});
    }

    async updateForm(form, state) {
        let res = await RestClient.patch(`forms/${form.id}`, {state});
        if (res.code == 200) {
            const rows = this.state.rows.map(
                row => {return (row.form === form
                    ? {...row, "form": res.data, "selected": false}
                    : row);});
            await this.setState({rows});
        } else {
            console.log(res.message);
            /* flash error message */
        }
    }

    async deleteForm(form) {
        let res = await RestClient.delete(`forms/${form.id}`);
        if (res.code == 200) {
            /* flash confirmed message ? */
            const rows = this.state.rows.filter(row => (row.form !== form));
            await this.setStateAsync({rows});
        } else {
            console.log(res.message);
            /* flash error message ? */
        }
    }

    async selectForm(form) {
        const rows = this.state.rows.map(row => {
            return row.form === form 
            ? {...row, selected: true}
            : row;});
        await this.setStateAsync({rows});
    }

    async unselectForm(form) {
        const rows = this.state.rows.map(row => {
            return row.form === form 
            ? {...row, selected: false}
            : row;});
        await this.setStateAsync({rows});
    }

    updateRows(state) {
        this.state.rows.forEach(row => {
            if (row.selected) this.updateForm(row.form, state);
        });
    }

    deleteRows(forms) {
        this.state.rows.forEach(row => {
            if (row.selected) this.deleteForm(row.form);
        });
    }

    async performAction(action) {
        const selected = (this.state.rows
            .filter(row => row.selected)
            .map(row => row.form));
        if (action === "approve") {
            if (await this.confirm("Confermi approvazione?", `Vuoi approvare ${selected.length} modulo/i selezionati?`)) {
                this.updateRows("approved");
            }
        } else if (action == "reject") {
            if (await this.confirm("Confermi rifiuto?", `Vuoi rifiutare ${selected.length} modulo/i selezionati?`)) {
                this.updateRows("rejected");
            }
        } else if (action == "resubmit") {
            if (await this.confirm("Riporta in valutazione?", `Vuoi risottomettere ${selected.length} modulo/i selezionati?`)) {
                this.updateRows("submitted");     
            }
        } else if (action == "redraft") {
            if (await this.confirm("Riporta in bozza?", `Vuoi riportare in bozza ${selected.length} modulo/i selezionati?`)) {
                await this.updateRows("draft");
            }
        } else if (action == "delete") {
            if (await this.confirm("Confermi cancellazione?", `Vuoi rimuovere ${selected.length} modulo/i selezionati?`)) {
                this.deleteRows();
            }
        }  else {
            console.log("ERROR: invalid action");
        }
    }

    renderPage() {
        return <div>
                <h1>Moduli</h1>
                <Card>
                    <HeadPanel Forms={this} />
                    <Table Forms={this} rows={this.state.rows} /> 
                </Card>
            </div>
    }

    async csvData() {
        const {code, message, data} = await RestClient.get("forms/", this.query);
        if (code !== 200) {
            console.log(`error ${message}`);
            // flash...
            return;
        }
        let keys = [];
        function addKey(key) {
            if (!keys.includes(key)) keys.push(key);
        }
        function addKeys(prefix, obj) {
            for(let key in obj) {
                const val=obj[key];
                if (typeof(val) === 'object') {
                    addKeys(`${prefix}${key}.`, val);
                } else {
                    addKey(`${prefix}${key}`);
                }
            }
        }
        data.forEach(form => addKeys("", form));
        keys.sort();
        const headers = (keys.map(key => { return {
                "label": key.replaceAll('.',' ').replaceAll('_',' '), 
                key}}));
        return {headers, data};
    }
}

function HeadPanel(props) {
    const {Forms} = props;
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
            callback={filter_button => Forms.update(filter_button.filter)}>
        </FilterButton>
        <ActionButton Forms={Forms} />

        <div className="flex-fill"></div>

        <div className="col-auto">
            <button type="button" className="btn btn-sm btn-primary"
                onClick={async () => Forms.setState({csvData: await Forms.csvData()})}>
                <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">Esporta in CSV</span>
            </button>
            {Forms.state.csvData !== undefined 
                ? <CSVDownload 
                    data={Forms.state.csvData.data}
                    headers={Forms.state.csvData.headers}
                    filename="caps-moduli.csv"
                    target="_blank" /> 
                : null }
        </div>
    </div>
}

function ActionButton(props) {
    const {Forms} = props;
    return <div className="dropdown">
    <button type="button" className="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Azioni
    </button>
    <div className="dropdown-menu p-2 shadow" style={{"width": "450px"}}>
        <button className="my-1 btn btn-success" style={{"width": "100%"}}
                onClick={() => Forms.performAction('approve')}>
            ✓ Approva i moduli selezionati
        </button>
        <button className="my-1 btn btn-danger" style={{"width": "100%"}}
                onClick={() => Forms.performAction('reject')}>
            ✗ Rifiuta i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() => Forms.performAction('resubmit')}>
            ⎌ Riporta in valutazione i moduli selezionati
        </button>
        <button className="my-1 btn btn-warning" style={{"width": "100%"}}
                onClick={() => Forms.performAction('redraft')}>
            ⎌ Riporta in bozza i moduli selezionati
        </button>
        <button className="my-1 btn btn-danger" style={{"width": "100%"}}
                onClick={() => Forms.performAction('delete')}> 
            🗑 Elimina i moduli selezionati
        </button>
    </div>
</div>
}

function Table(props) {
    if (props.rows === undefined) {
        return <LoadingMessage>Caricamento moduli...</LoadingMessage>
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
                {props.rows.map(row => 
                    <FormRow 
                        key={row.form.id} 
                        row={row} 
                        Forms={props.Forms}/>)}
                </tbody>
            </table>
        </div>
    }
}

function FormRow(props) {
    const {row: {form, selected}, Forms} = props;
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={
            () => selected 
                ? Forms.unselectForm(form) 
                : Forms.selectForm(form)}/></td>
        <td><FormBadge form={form}></FormBadge></td>
        <td>{form.user.name}</td>
        <td>{form.form_template.name}</td>
        <td>{form.date_submitted}</td>
        <td>{form.date_managed}</td>
        <td>
            <div className="d-none d-xl-inline-flex flex-row align-items-center">
                <a href={`${Forms.props.root}forms/view/${form.id}`}>
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
