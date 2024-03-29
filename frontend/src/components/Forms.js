'use strict';

import React, { useState } from 'react';
import Moment from 'moment';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import { FormStateBadge } from './StateBadge';
import ItemsBase from './ItemsBase';
import { FilterButton, FilterInput, FilterSelect, FilterBadges, 
        ActionButtons, ActionButton, ColumnHeader } from './Table';
import { CSVDownload, CSVLink } from "react-csv";
import restClient from '../modules/api';

class Forms extends ItemsBase {
    constructor(props) {
        super(props);
    }

    items_name() {
        return "forms";
    }

    item_items_noun() {
        return "modulo/i";
    }

    shortItemRender(form) {
        return <>modulo <i>{form.form_template.name}</i> di <b>{ form.user.name }</b></>
    }

    encodeQueryParams(query) {
        const params = new URLSearchParams();

        Object.entries(query).forEach( ([key, el]) => {
            params.append(key, el)
        })

        return params.toString()
    }

    downloadCSV() {
        window.location.href = "/forms.csv?" + this.encodeQueryParams(this.state.query)
    }

    downloadXLSX() {
        window.location.href = "/forms.xlsx?" + this.encodeQueryParams(this.state.query)
    }

    renderPage() {
        return <div>
            <h1>Moduli</h1>
            <Card>
                <div className="d-flex mb-2">
                    <FilterButton onChange={ this.onFilterChange.bind(this) }>
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
                        <button type="button" className="btn btn-sm btn-primary mr-2" onClick={this.downloadCSV.bind(this)}>
                            <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">Esporta in CSV</span>
                        </button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={this.downloadXLSX.bind(this)}>
                            <i className="fas fw fa-file-excel"></i><span className="ml-2 d-none d-md-inline">Esporta in XLSX</span>
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
                            <th><ColumnHeader self={ this } name="state">Stato</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="user.surname">Nome</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="form_template.name">Modello</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="date_submitted">Inviato</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="date_managed">Gestito</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="modified">Modificato</ColumnHeader></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        { this.state.rows === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento moduli...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => <FormRow
                                root={this.props.root}
                                key={row.item.id} 
                                row={row} 
                                onToggle={() => {this.toggleItem(row.item)}}
                                />)
                        }
                        </tbody>
                    </table>
                    { this.state.rows && 
                            <p>
                            {this.state.rows.length < this.state.rows.total 
                            ? <button className="btn btn-primary mx-auto d-block" onClick={this.extendLimit.bind(this)}>
                                Carica più righe (altri {this.state.rows.total - this.state.rows.length} da mostrare)
                            </button>
                            : null}
                            </p>
                        }
                </div>
            </Card>
    </div>
    }

    // compose user friendly column name
    csv_label_for_key(key) {
        return super.csv_label_for_key(key.replace(/^(data\.)/,'')); // i campi dei moduli hanno il prefisso data che è fuorviante
    }
}

function FormRow(props) {
    const {row: {selected, item}, onToggle, root} = props;
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
        <td><FormStateBadge form={ item } /></td>
        <td><a href={`${root}users/view/${item.user.id}`}>{item.user.name}</a></td>
        <td>{item.form_template.name}</td>
        <td>{ item.date_submitted && Moment(item.date_submitted).format("DD/MM/YYYY") }</td>
        <td>{ item.date_managed && Moment(item.date_managed).format("DD/MM/YYYY") }</td>
        <td>{ item.modified && Moment(item.modified).format("DD/MM/YYYY") }</td>
        <td>
            <div className="d-inline-flex flex-row align-items-center">
                <a href={`${root}forms/view/${item.id}`}>
                    <button type="button" className="btn btn-sm btn-primary mr-2">
                    <i className="fas fa-eye"></i>
                    <span className="ml-2 d-none d-xl-inline">Visualizza</span>
                    </button>
                </a>
            </div>
        </td>
    </tr>
}

export default Forms;
