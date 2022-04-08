'use strict';

import React, { useState } from 'react';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';
import CapsPage from './CapsPage';
import { FilterButton, FilterInput, FilterSelect, FilterBadges, 
        ActionButtons, ActionButton } from './Table';
import { CSVDownload, CSVLink } from "react-csv";
import restClient from '../modules/api';
import { Dropdown } from 'react-bootstrap';

class Forms extends CapsPage {
    constructor(props) {
        super(props);

        this.state = {
            ...this.state,
            'rows': null,
            'query': this.props.query,
            'total': null
        };
    }
    
    async componentDidMount() {
        // await new Promise(r => setTimeout(r, 5000)); // sleep 5
        this.load();
    }

    async load() {
        try {
            const forms = await restClient.get(`forms/`, this.state.query);
            const rows = forms.map(form => {return {
                form,
                selected: false
            }})
            rows.total = forms.total;
            this.setState({ rows });
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async onFilterChange(e) {
        let query = {...this.state.query};
        if (e.target.value === '') {
            delete query[e.target.name];
        } else {
            query[e.target.name] = e.target.value;
        }
        await this.setStateAsync({query});
        this.load();
    }

    async onFilterRemoveField(field) {
        let query = {...this.state.query};
        delete query[field];
        await this.setStateAsync({query});
        this.load();
    }

    async extendLimit() {
        let _limit = this.state.query._limit;
        if (_limit) {
            _limit += 10;
            let query = {...this.state.query, _limit}
            await this.setStateAsync({query});
            this.load();
        }
    }

    async updateForm(form, state, message) {
        try {
            form = await restClient.patch(`forms/${ form.id }`, {state});
            const rows = this.state.rows.map(
                row => { return (row.form.id === form.id
                    ? {...row, form, "selected": false}
                    : row);});
            rows.total = this.state.rows.total;
            this.flashSuccess(<>modulo <i>{form.form_template.name}</i> di <b>{ form.user.name }</b> { message }</>);
            this.setStateAsync({rows});
        } catch(err) {
            this.flashCatch(err);
        }
}

    async deleteForm(form) {
        try {
            await restClient.delete(`forms/${form.id}`);

            // elimina la form dall'elenco
            let prev_length = this.state.rows.length;
            const rows = this.state.rows.filter(row => (row.form.id !== form.id));
            rows.total = this.state.rows.total + rows.length - prev_length;

            this.flashMessage(<>Modulo <i>{ form.form_template.name }</i> di <b>{ form.user.name }</b> eliminato.</>);
            this.setState({ rows });
        } catch(err) {
            this.flashCatch(err);
        }

    }

    toggleForm(form) {
        const rows = this.state.rows.map(row => {
            return row.form.id === form.id
            ? {...row, "selected": !row.selected}
            : row;});
        rows.total = this.state.rows.total;
        this.setState({rows});
    }

    updateRows(state, message) {
        this.state.rows.forEach(row => {
            if (row.selected) this.updateForm(row.form, state, message);
        });
    }

    countSelected() {
        return this.state.rows.filter(row => row.selected).length;
    }

    async approveSelected() {
        if (await this.confirm("Confermi approvazione?", 
            `Vuoi approvare ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("approved", "approvato");
        }
    }

    async rejectSelected() {
        if (await this.confirm("Confermi rifiuto?", 
            `Vuoi rifiutare ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("rejected", "respinto");
        }
    }

    async resubmitSelected() {
        if (await this.confirm("Riporta in valutazione?", 
            `Vuoi risottomettere ${this.countSelected()} modulo/i selezionati?`)) {
            this.updateRows("submitted", "riportato in valutazione"); 
        }    
    }

    async redraftSelected() {
        if (await this.confirm("Riporta in bozza?", 
            `Vuoi riportare in bozza ${this.countSelected()} modulo/i selezionati?`)) {
                this.updateRows("draft", "riportato in bozza");
        }
    }

    async deleteSelected() {
        if (await this.confirm("Confermi cancellazione?", 
            `Vuoi rimuovere ${this.countSelected()} modulo/i selezionati?`)) {

                // delete selected forms one by one
                this.state.rows.forEach(row => {
                    if (row.selected) this.deleteForm(row.form);
                });
            }
    }

    renderPage() {
        const onFilterChange = this.onFilterChange.bind(this);
        return <div>
            <h1>Moduli</h1>
            <Card>
                <div className="d-flex mb-2">
                    <FilterButton onChange={onFilterChange}>
                        <FilterSelect name="state" label="stato" value={ this.state.query.state || ""}>
                            <option value="">tutti</option> 
                            <option value="draft">bozze</option>
                            <option value="submitted">da valutare</option>
                            <option value="approved">approvati</option>
                            <option value="rejected">rifiutati</option>
                        </FilterSelect>
                        <FilterInput name="user.surname" label="cognome" value={ this.state.query.surname || ""}/>
                        <FilterInput name="form_template.name" label="modello" value={ this.state.query['form_template.name'] || ""} />
                    </FilterButton>

                    <ActionButtons>
                        <ActionButton className="btn-success" onClick={() => this.approveSelected()}>
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
                <FilterBadges 
                    query={this.state.query} 
                    onRemoveField={field => this.onFilterRemoveField(field)}></FilterBadges>
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
                        { this.state.rows === null 
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
                    { this.state.rows && 
                            <p>
                            {this.state.rows.length < this.state.rows.total 
                            ? <button className="btn btn-primary" onClick={this.extendLimit.bind(this)}>Carica più righe</button>
                            : null}
                            {` [${this.state.rows.length}/${this.state.rows.total} moduli mostrati]`}
                            </p>
                        }
                </div>
            </Card>
    </div>
    }

    async csvData() {
        try {
            let query = {...this.state.query};

            // carica tutti i dati, rimuovi "limit"
            // ma mantieni eventuali filtri (e ordinamento)
            delete query._limit;
            const data = await restClient.get("forms/", query);

            // collect all keys from all forms
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

            // compose user friendly column name
            function label_for_key(key) {
                let label = key;
                label = label.replace(/^(data\.)/,''); // i campi dei moduli hanno il prefisso data che è fuorviante
                label = label.replaceAll('.', ' ');
                label = label.replaceAll('_', ' ');
                return label;
            }

            const headers = (keys.map(key => { return {
                    label: label_for_key(key),
                    key }}));

            return {headers, data};
        } catch(err) {
            this.flashCatch(err);
        }
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
