'use strict';

import React from 'react';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import ItemsBase from './ItemsBase';
import { ThesisDefenseStateBadge } from './StateBadge';
import {
    FilterButton, FilterInput, FilterSelect, FilterBadges,
    ColumnHeader, ResponsiveButton, ResponsiveButtons
} from './Table';
import { CSVDownload } from 'react-csv';

function formatDate(value, timezone) {
    if (!value) return null;
    const options = { dateStyle: 'short', timeStyle: 'short' };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('it-IT', options).format(new Date(value));
}

class ThesisDefenses extends ItemsBase {
    constructor(props) {
        super(props);
    }

    items_name() {
        return 'thesis_defenses';
    }

    item_items_noun() {
        return 'domanda/e di laurea';
    }

    shortItemRender(defense) {
        return <>domanda di laurea <i>{defense.title}</i> di <b>{defense.user.name}</b></>
    }

    renderPage() {
        return <div>
            <h1>Domande di partecipazione alle sessioni di laurea</h1>
            <Card>
                <div className="d-flex mb-2">
                    <FilterButton onChange={this.onFilterChange.bind(this)}>
                        <FilterSelect name="state" label="stato" value={this.state.query.state || ''}>
                            <option value="">tutte</option>
                            <option value="submitted">da valutare</option>
                            <option value="approved">approvate</option>
                            <option value="rejected">respinte</option>
                        </FilterSelect>
                        <FilterInput name="user.surname" label="cognome" value={this.state.query['user.surname'] || ''} />
                        <FilterInput name="degree_session.degree.name" label="laurea" value={this.state.query['degree_session.degree.name'] || ''} />
                        <FilterInput name="degree_session.name" label="sessione" value={this.state.query['degree_session.name'] || ''} />
                        <FilterInput name="title" label="titolo" value={this.state.query.title || ''} />
                    </FilterButton>

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
                                filename="caps-domande-laurea.csv"
                                target="_blank" />
                            : null}
                    </div>
                </div>
                <FilterBadges
                    query={this.state.query}
                    onRemoveField={field => this.onFilterRemoveField(field)}></FilterBadges>
                <div className="table-responsive-lg">
                    <table className="table">
                        <thead>
                            <tr>
                                <th><ColumnHeader self={this} name="state">Stato</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="user.surname">Studente</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="degree_session.degree.name">Laurea</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="degree_session.name">Sessione</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="title">Titolo</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="scheduled_at">Programmazione</ColumnHeader></th>
                                <th><ColumnHeader self={this} name="submitted_at">Inviata</ColumnHeader></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.rows === null
                                ? <tr><td colSpan="8"><LoadingMessage>Caricamento domande di laurea...</LoadingMessage></td></tr>
                                : this.state.rows.map(row =>
                                    <ThesisDefenseRow
                                        key={row.item.id}
                                        row={row}
                                        root={this.props.root}
                                        timezone={this.props.timezone} />)
                            }
                        </tbody>
                    </table>
                    {this.state.rows &&
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

function ThesisDefenseRow({row: {item}, root, timezone}) {
    return <tr>
        <td><ThesisDefenseStateBadge defense={item} /></td>
        <td><a href={`${root}users/view/${item.user.id}`}>{item.user.name}</a><br /><small>{item.user.number}</small></td>
        <td>{item.degree_session.degree.name}</td>
        <td>{item.degree_session.name}<br /><small>{item.degree_session.start_date}</small></td>
        <td>{item.title}</td>
        <td>
            {item.scheduled_at ? <>{formatDate(item.scheduled_at, timezone)}{timezone && <> ({timezone})</>}</> : <>-</>}
            {item.venue ? <><br />{item.venue}</> : null}
        </td>
        <td>{formatDate(item.submitted_at, timezone)}</td>
        <td>
            <ResponsiveButtons>
                <ResponsiveButton className="btn-primary" key="view" href={`${root}thesis-defenses/view/${item.id}`}>
                    <i className="fas fa-eye mr-2" />Visualizza
                </ResponsiveButton>
                <ResponsiveButton className="btn-primary" key="manage" href={`${root}thesis-defenses/manage/${item.id}`}>
                    <i className="fas fa-cog mr-2" />Gestisci
                </ResponsiveButton>
            </ResponsiveButtons>
        </td>
    </tr>
}

export default ThesisDefenses;
