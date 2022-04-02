'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';
import CapsPage from './CapsPage';
import { FilterButton, FilterInput, FilterSelect, 
        ActionButtons, ActionButton } from './Table';
import { CSVDownload, CSVLink } from "react-csv";

function convert_query(q) {
    let query = {...q};
    // TODO: decidere come codificare i filtri
    for(let key in query) {
        if (query[key] == "") delete query[key];
        else query[key] = JSON.stringify(query[key]);
    }
    return query;
}

class Forms extends CapsPage {
    constructor(props) {
        super(props);
        this.state = {
            'rows': undefined,
            'query': this.props.query,
        };
    }
    
    async componentDidMount() {
        // await new Promise(r => setTimeout(r, 5000)); // sleep 5
        this.load();
    }

    async load() {
        let query = convert_query(this.state.query);
        const forms = (await RestClient.get(`forms/`, query))['data'];
        const rows = forms.map(form => {return {
            form,
            selected: false
        }})
        this.setState({rows});
    }

    onFilterChange(e) {
        let query = {...this.state.query};
        query[e.target.name] = e.target.value;
        this.setState({query}, () => this.load());
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

    toggleForm(form) {
        const rows = this.state.rows.map(row => {
            return row.form === form
            ? {...row, "selected": !row.selected}
            : row;});
        this.setState({rows});
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

    countSelected() {
        return this.state.rows.filter(row => row.selected).length;
    }

    async approveSelected() {
        if (await this.confirm("Confermi approvazione?", 
            `Vuoi approvare ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("approved");
        }
    }

    async rejectSelected() {
        if (await this.confirm("Confermi rifiuto?", 
            `Vuoi rifiutare ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("rejected");
        }
    }

    async resubmitSelected() {
        if (await this.confirm("Riporta in valutazione?", 
            `Vuoi risottomettere ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("submitted"); 
        }    
    }

    async redraftSelected() {
        if (await this.confirm("Riporta in bozza?", 
            `Vuoi riportare in bozza ${this.countSelected()} modulo/i selezionati?`)) {
                this.updateRows("draft");
        }
    }

    async deleteSelected() {
        if (await this.confirm("Confermi cancellazione?", 
            `Vuoi rimuovere ${this.countSelected()} modulo/i selezionati?`)) {
                this.deleteRows();
        }
    }

    renderPage() {
        const onFilterChange = this.onFilterChange.bind(this);
        return <div>
            <h1>Moduli</h1>
            <Card>
                <div className="d-flex mb-2">
                    <FilterButton onChange={onFilterChange}>
                        <FilterSelect name="state" label="stato">
                            <option value="">tutti</option> 
                            <option value="draft">bozze</option>
                            <option value="submitted">da valutare</option>
                            <option value="approved">approvati</option>
                            <option value="rejected">rifiutati</option>
                        </FilterSelect>
                        <FilterInput name="surname" label="cognome" />
                        <FilterInput name="formTemplate" label="modello" />
                        <FilterInput name="name" label="nome" />
                    </FilterButton>

                    <ActionButtons>
                        <ActionButton onClick={() => this.approveSelected()}>
                            ✓ Approva i moduli selezionati
                        </ActionButton>
                        <ActionButton className="btn-danger" onClick={() => this.rejectSelected()}>
                            ✗ Rifiuta i moduli selezionati
                        </ActionButton>
                        <ActionButton className="btn-warning" onClick={() => this.resubmitSelected()}>
                            ⎌ Riporta in valutazione i moduli selezionati
                        </ActionButton>
                        <ActionButton className="btn-warning" onClick={() => this.redraftSelected()}>
                            ⎌ Riporta in bozza i moduli selezionati
                        </ActionButton>
                        <ActionButton className="btn-danger" onClick={() => this.deleteSelected()}> 
                            🗑 Elimina i moduli selezionati
                        </ActionButton>
                    </ActionButtons>

                    <div className="flex-fill"></div>

                    <div className="col-auto">
                        <button type="button" className="btn btn-sm btn-primary"
                            onClick={async () => this.setState({csvData: await this.csvData()})}>
                            <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">Esporta in CSV</span>
                        </button>
                        {this.state.csvData !== undefined 
                            ? <CSVDownload 
                                data={this.state.csvData.data}
                                headers={this.state.csvData.headers}
                                filename="caps-moduli.csv"
                                target="_blank" /> 
                            : null }
                    </div>
                </div>
                <div className="table-responsive-lg">
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
                        { this.state.rows === undefined 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento moduli...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => <FormRow 
                                key={row.form.id} 
                                row={row} 
                                onToggle={() => {this.toggleForm(row.form)}}
                                href={`${this.props.root}forms/view/${row.form.id}`}
                                />)
                        }
                        </tbody>
                    </table>
                </div>
            </Card>
    </div>
    }

    async csvData() {
        // carica tutti i dati, rimuovi "limit"
        let query = convert_query(this.state.query);
        delete query.limit;
        const {code, message, data} = await RestClient.get(
            "forms/", query);
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

function FormRow(props) {
    const {row: {selected, form}, href, onToggle} = props;
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
        <td><FormBadge form={form}></FormBadge></td>
        <td>{form.user.name}</td>
        <td>{form.form_template.name}</td>
        <td>{form.date_submitted}</td>
        <td>{form.date_managed}</td>
        <td>
            <div className="d-none d-xl-inline-flex flex-row align-items-center">
                <a href={href}>
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
