'use strict';

import React from 'react';
import restClient from '../modules/api';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import { FilterButton, FilterInput, FilterBadges, ColumnHeader } from './Table';
import { CSVDownload, CSVLink } from "react-csv";


class Exams extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            query: {},
            csvData: null,
            rows: null,
        };

        this.Page = props.Page;

        this.load();
    }

    items_name() {
        return "exams";
    }

    async load() {
        try {
            const items = await restClient.get(`${this.items_name()}/`, this.state.query);
            const rows = items.map(item => {return {
                item,
                selected: false
            }});
            rows.total = items.total;
            this.setState({ rows });
            this.Page.flashMessage("flash!");
        } catch(err) {
            this.Page.flashCatch(err);
        }
    }

    onFilterChange() {
    }

    render() {
        return <>
            <h1>Esami</h1>
            <Card>
                <div className="d-flex mb-2">
                    <FilterButton onChange={ this.onFilterChange.bind(this) }>
                        <FilterInput name="name" label="nome" value={ this.state.query.name || ""}/>
                        <FilterInput name="code" label="codice" value= { this.state.query.code || ""}/>
                        <FilterInput name="sector" label="settore" value={ this.state.query.sector || ""} />
                        <FilterInput name="credits" label="crediti" value={ this.state.query.credits || "" } />
                    </FilterButton>

                    <button type="button" className="btn btn-sm btn-primary mr-2">
                        <i className="fas fa-plus"></i><span className="d-none d-md-inline ml-2">Aggiungi esame</span>
                    </button>

                    <div className="flex-fill"></div>

                    <div className="col-auto">
                        <button type="button" className="btn btn-sm btn-primary"
                            onClick={async () => this.setState({csvData: await this.csvData()})}>
                            <i className="fas fw fa-download"></i><span className="ml-2 d-none d-md-inline">CSV</span>
                        </button>
                        {this.state.csvData !== null 
                            ? <CSVDownload 
                                data={this.state.csvData.data}
                                headers={this.state.csvData.headers}
                                filename="caps-exams.csv"
                                target="_blank" /> 
                            : null }
                        <button type="button" className="btn btn-sm btn-primary">
                            <i className="fas fw fa-file-excel"></i>
                                <span className="ml-2 d-none d-md-inline">
                                    <span className="d-none d-xl-inline">Esporta in</span> Excel</span>
                        </button>

                    </div>
                </div>
                <FilterBadges 
                    query={this.state.query} 
                    onRemoveField={field => this.onFilterRemoveField(field)}>
                </FilterBadges>

                <div className="table-responsive-lg">
                    <table className="table">
                        <thead>
                            <tr>
                            <th></th>
                            <th><ColumnHeader self={this} name="name">Nome</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="tags">Tags</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="code">Codice</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="sector">Settore</ColumnHeader></th>
                            <th><ColumnHeader self={this} name="credits">Crediti</ColumnHeader></th>
                            <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        { this.state.rows === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento esami...</LoadingMessage></td></tr>
                            : this.state.rows.map(row => 
                                <ExamRow 
                                    key={row.item.id} 
                                    row={row} 
                                    onToggle={() => {this.toggleItem(row.item)}}
                                    href={`${this.props.root}exams/view/${row.item.id}`}
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
    </>
    }

}

export default Exams;

function ExamRow({ key, row, onToggle, href }) {
    return <tr style={selected?{background: "lightgray"}:{}}>
    <td><input type="checkbox" checked={ selected } readOnly onClick={ onToggle }/></td>
    <td><a href={ href }>{ item.name }</a></td>
    <td>{ item.tags }</td>
    <td>{ item.code }</td>
    <td>{ item.sector }</td>
    <td>{ item.credits }</td>
</tr>
}