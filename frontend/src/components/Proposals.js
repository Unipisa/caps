'use strict';

import React, { useState } from 'react';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import ProposalBadge from './ProposalBadge';
import CapsPage from './CapsPage';
import { FilterButton, FilterInput, FilterSelect, FilterBadges, 
        ActionButtons, ActionButton } from './Table';
import { CSVDownload, CSVLink } from "react-csv";
import restClient from '../modules/api';
import CapsController from '../caps-controller';
import { faThList } from '@fortawesome/free-solid-svg-icons';

class Proposals extends CapsPage {
    constructor(props) {
        super(props);

        const stored_query = JSON.parse(sessionStorage.getItem('proposals-filter'));

        this.state = {
            ...this.state,
            'rows': null,
            'query': this.props.query || stored_query || {},
            'total': null
        };
    }
    
    async componentDidMount() {
        // await new Promise(r => setTimeout(r, 5000)); // sleep 5
        this.load();
    }

    async load() {
        try {
            const forms = await restClient.get(`proposals/`, this.state.query);
            const rows = forms.map(proposal => {return {
                proposal,
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
        sessionStorage.setItem('proposals-filter', JSON.stringify(query));
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

    async updateProposal(proposal, state, message) {
        try {
            form = await restClient.patch(`proposals/${ proposal.id }`, {state});
            const rows = this.state.rows.map(
                row => { return (row.proposal.id === form.id
                    ? {...row, proposal, "selected": false}
                    : row);});
            rows.total = this.state.rows.total;
            this.flashSuccess(<>piano <i>{ proposal }</i> di <b>{ proposal.user.name }</b> { message }</>);
            this.setStateAsync({rows});
        } catch(err) {
            this.flashCatch(err);
        }
}

    async deleteProposal(proposal) {
        try {
            await restClient.delete(`proposals/${proposal.id}`);

            // elimina la form dall'elenco
            let prev_length = this.state.rows.length;
            const rows = this.state.rows.filter(row => (row.proposal.id !== proposal.id));
            rows.total = this.state.rows.total + rows.length - prev_length;

            this.flashMessage(<>Piano <i>{ proposal }</i> di <b>{ proposal.user.name }</b> eliminato.</>);
            this.setState({ rows });
        } catch(err) {
            this.flashCatch(err);
        }

    }

    toggleProposal(proposal) {
        const rows = this.state.rows.map(row => {
            return row.proposal.id === proposal.id
            ? {...row, "selected": !row.selected}
            : row;});
        rows.total = this.state.rows.total;
        this.setState({rows});
    }

    updateRows(state, message) {
        this.state.rows.forEach(row => {
            if (row.selected) this.updateProposal(row.proposal, state, message);
        });
    }

    countSelected() {
        return this.state.rows.filter(row => row.selected).length;
    }

    async approveSelected() {
        if (await this.confirm("Confermi approvazione?", 
            `Vuoi approvare ${this.countSelected()} piano/i selezionati?`)) {
            this.updateRows("approved", "approvato");
        }
    }

    async rejectSelected() {
        if (await this.confirm("Confermi rifiuto?", 
            `Vuoi rifiutare ${this.countSelected()} piano/i selezionati?`)) {
            this.updateRows("rejected", "respinto");
        }
    }

    async resubmitSelected() {
        if (await this.confirm("Riporta in valutazione?", 
            `Vuoi risottomettere ${this.countSelected()} pianoo/i selezionati?`)) {
            this.updateRows("submitted", "riportato in valutazione"); 
        }    
    }

    async redraftSelected() {
        if (await this.confirm("Riporta in bozza?", 
            `Vuoi riportare in bozza ${this.countSelected()} piano/i selezionati?`)) {
                this.updateRows("draft", "riportato in bozza");
        }
    }

    async deleteSelected() {
        if (await this.confirm("Confermi cancellazione?", 
            `Vuoi rimuovere ${this.countSelected()} piano/i selezionati?`)) {

                // delete selected forms one by one
                this.state.rows.forEach(row => {
                    if (row.selected) this.deleteProposal(row.proposal);
                });
            }
    }

    async downloadSelected() {
        this.state.rows.forEach(row => {
            if (row.selected) {
                const proposal = row.proposal;
                const url = `${this.props.root}proposals/pdf/${proposal.id}`;
                // We create an <a download href="..."> element, which forces 
                // the file to be downloaded and not opened in a new tab. 
                const el = document.createElement('a');
                el.href = url; el.download = "1"; el.click();
            }
        });
    }

    renderPage() {
        const onFilterChange = this.onFilterChange.bind(this);
        return <div>
            <h1>Piani di Studio</h1>
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
                        <FilterInput name="curriculum.academic_year" label="anno" value= { this.state.query['curriculum.academic_year'] || ""}/>
                        <FilterInput name="curriculum.degree.name" label="laurea" value={ this.state.query['curriculum.degree.name'] || ""} />
                        <FilterInput name="curriculum.name" label="curriculum" value={ this.state.query['curriculum.name'] || "" } />
                        <FilterInput name="exam.name" label="nome esame" value={ this.state.query['exam.name'] || "" } />
                        <FilterInput name="free_exam.name" label="nome esame libero" value={ this.state.query['free_exam.name'] || ""} />
                    </FilterButton>

                    <ActionButtons>
                        <ActionButton className="btn-success" onClick={() => this.approveSelected()}>
                            ✓ Approva i piani di studio selezionati
                        </ActionButton>
                        <ActionButton className="btn-danger" onClick={() => this.rejectSelected()}>
                            ✗ Rifiuta i piani di studio selezionati
                        </ActionButton>
                        <ActionButton className="btn-warning" onClick={() => this.resubmitSelected()}>
                            ⎌ Riporta in valutazione i piani di studio selezionati
                        </ActionButton>
                        <ActionButton className="btn-warning" onClick={() => this.redraftSelected()}>
                            ⎌ Riporta in bozza i piani di studio selezionati
                        </ActionButton>
                        <ActionButton className="btn-danger" onClick={() => this.deleteSelected()}> 
                            🗑 Elimina i piani di studio selezionati
                        </ActionButton>
                        <ActionButton onClick={() => this.downloadSelected()}>
                            🡇 Scarica i piani selezionati in PDF
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
                                filename="caps-piani.csv"
                                target="_blank" /> 
                            : null }
                        <button type="button" className="btn btn-sm btn-primary" onClick={() => { location.pathname += '.xlsx' }}>
                            <i className="fas fw fa-file-excel"></i>
                                <span className="ml-2 d-none d-md-inline">
                                    <span className="d-none d-xl-inline">Esporta in </span>Excel
                                </span>
                        </button>

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
                            <th>Anno</th>
                            <th>Laurea</th>
                            <th>Piano di studio</th>
                            <th>Ultima modifica</th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        { this.state.rows === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento piani di studio...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => 
                                <ProposalRow 
                                    key={row.proposal.id} 
                                    row={row} 
                                    onToggle={() => {this.toggleProposal(row.proposal)}}
                                    href={`${this.props.root}proposals/view/${row.proposal.id}`}
                                    href_pdf={`${this.props.root}proposals/pdf/${row.proposal.id}`}
                                    />)
                        }
                        </tbody>
                    </table>
                    { this.state.rows && 
                            <p>
                            {this.state.rows.length < this.state.rows.total 
                            ? <button className="btn btn-primary" onClick={this.extendLimit.bind(this)}>Carica più righe</button>
                            : null}
                            {` [${this.state.rows.length}/${this.state.rows.total} piani di studio mostrati]`}
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
            const data = await restClient.get("proposals/", query);

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

            data.forEach(proposal => addKeys("", proposal));

            keys.sort();

            // compose user friendly column name
            function label_for_key(key) {
                let label = key;
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

function ProposalRow(props) {
    const {row: {selected, proposal}, href, href_pdf, onToggle} = props;
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
        <td><ProposalBadge proposal={proposal}></ProposalBadge></td>
        <td>{proposal.user.name}</td>
        <td>{proposal.curriculum.degree.year}</td>
        <td>{proposal.curriculum.degree.name}</td>
        <td>{proposal.curriculum.name}</td>
        <td>{proposal.modified}</td>
        <td>
            <div className="d-none d-xl-inline-flex flex-row align-items-center">
                <a href={href}>
                    <button type="button" className="btn btn-sm btn-primary mr-2">
                    <i className="fas fa-eye mr-2"></i>
                    Visualizza
                    </button>
                </a>

                <a href={href_pdf}>
                    <button type="button" className="btn btn-sm btn-secondary mr-2">
                        <i className="fas fa-file-pdf mr-2"></i>
                        Scarica
                    </button>
                </a>
                <a href={`${href_pdf}?show_comments=1`}> 
                    <button type="button" className="btn btn-sm btn-secondary">
                        <i className="fas fa-file-pdf mr-2"></i>
                        Commenti
                    </button>
                </a>
            </div>

        </td>
    </tr>
}

export default Proposals;
