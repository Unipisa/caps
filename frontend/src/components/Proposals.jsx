'use strict';

import React from 'react';
import Moment from 'moment';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import { ProposalStateBadge } from './StateBadge';
import ItemsBase from './ItemsBase';
import { FilterButton, FilterInput, FilterSelect, FilterBadges, 
        ActionButtons, ActionButton, ColumnHeader,
        ResponsiveButton, ResponsiveButtons 
        } from './Table';
import { CSVDownload, CSVLink } from "react-csv";

class Proposals extends ItemsBase {
    constructor(props) {
        super(props);
    }

    items_name() { 
        return "proposals";
    }

    item_items_noun() {
        return "piano/i di studio";
    }

    shortItemRender(proposal) {
        return <>piano <i>{ proposal.curriculum.name }</i> di <b>{ proposal.user.name }</b></>
    }
 
    renderPage() {
        return <div>
            <h1>Piani di Studio</h1>
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
                        <button type="button" className="btn btn-sm btn-primary mr-2"
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
                            <th><ColumnHeader self={this} name="state">Stato</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="user.surname">Nome</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="curriculum.degree.academic_year">Anno</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="curriculum.degree.name">Laurea</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="curriculum.name">Piano di studio</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="modified">Ultima modifica</ColumnHeader></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        { this.state.rows === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento piani di studio...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => 
                                <ProposalRow 
                                    key={row.item.id} 
                                    row={row} 
                                    onToggle={() => {this.toggleItem(row.item)}}
                                    root={this.props.root}
                                    />)
                        }
                        </tbody>
                    </table>
                    { this.state.rows && 
                            <p>
                            {this.state.rows.length < this.state.rows.total 
                            ? <button className="btn btn-primary mx-auto d-block" onClick={this.extendLimit.bind(this)}>
                                Carica più righe (altri {`${this.state.rows.total - this.state.rows.length}`} da mostrare)
                            </button>
                            : null}
                            </p>
                        }
                </div>
            </Card>
    </div>
    }
}

function ProposalRow({row: {selected, item}, root, onToggle}) {
    return <tr style={selected?{background: "lightgray"}:{}}>
        <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
        <td><ProposalStateBadge proposal={ item } /></td>
        <td><a href={root + "users/view/" +  item.user.id }>{ item.user.name }</a></td>
        <td>{ item.curriculum.degree.academic_year }</td>
        <td>{ item.curriculum.degree.name }</td>
        <td>{ item.curriculum.name }</td>
        <td>{ item.modified && Moment(item.modified).format("DD/MM/YYYY H:mm") }</td>
        <td>
            <ResponsiveButtons>
                <ResponsiveButton className="btn-primary" key="view" href={`${root}proposals/view/${item.id}`}>
                    <i className="fas fa-eye mr-2" />Visualizza
                </ResponsiveButton>
                <ResponsiveButton className="btn-secondary" key="pdf" href={`${root}proposals/pdf/${item.id}`}>
                    <i className="fas fa-file-pdf mr-2" />Scarica
                </ResponsiveButton>
                <ResponsiveButton className="btn-secondary" key="pdf2" href={`${root}proposals/pdf/${item.id}?show_comments=1`}>
                    <i className="fas fa-file-pdf mr-2" />Scarica (con&nbsp;commenti)
                </ResponsiveButton>
            </ResponsiveButtons>
        </td>
    </tr>
}

export default Proposals;
