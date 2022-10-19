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

class Logs extends ItemsBase {
    constructor(props) {
        super(props);
        this.state.query._sort = "timestamp"
        this.state.query._direction = "desc"
    }

    items_name() {
        return "logs";
    }

    item_items_noun() {
        return "azione/i";
    }

    shortItemRender(log) {
        return <>azione <i>{log.action}</i> di <b>{ log.user.name }</b></>
    }

    renderPage() {
        return <div>
            <h1>Azioni</h1>
            <Card>
                <div className="d-flex mb-2">
                  {
                  //  <FilterButton onChange={ this.onFilterChange.bind(this) }>
                  //      <FilterSelect name="state" label="stato" value={ this.state.query.state || ""}>
                  //          <option value="">tutti</option> 
                  //          <option value="draft">bozze</option>
                  //          <option value="submitted">da valutare</option>
                  //          <option value="approved">approvati</option>
                  //          <option value="rejected">rifiutati</option>
                  //      </FilterSelect>
                  //      <FilterInput name="user.surname" label="cognome" value={ this.state.query.surname || ""}/>
                  //      <FilterInput name="form_template.name" label="modello" value={ this.state.query['form_template.name'] || ""} />
                  //  </FilterButton>
                  }
                    <div className="flex-fill"></div>

                </div>
                <FilterBadges 
                    query={this.state.query} 
                    onRemoveField={field => this.onFilterRemoveField(field)}></FilterBadges>
                <div className="table-responsive-lg">
                    <table className="table">
                        <thead>
                            <tr>
                            <th></th>
                            <th><ColumnHeader self={ this } name="timestamp">Timestamp</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="user">Utente</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="">id Piano</ColumnHeader></th>
                            <th><ColumnHeader self={ this } name="">Azione</ColumnHeader></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        { this.state.rows === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento azioni...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => <LogRow 
                                key={row.item.id} 
                                row={row} 
                                onToggle={() => {this.toggleItem(row.item)}}
                                href={`${this.props.root}forms/view/${row.item.id}`}
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
}

function LogRow(props) {
    const {row: {selected, item}, href, onToggle} = props;
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
        <td>{ Moment(item.timestamp).format("DD/MM/YYYY hh:mm:ss") }</td>
        <td>{item.user.name}</td>
        <td>{item.external_id}</td>
        <td>{item.action}</td>
    </tr>
}

export default Logs;
