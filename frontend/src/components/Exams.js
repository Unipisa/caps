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
            query: {_limit: 10},
            csvData: null,
            data: null,
        };

        this.Page = props.Page;

        this.load();
    }

    items_name() {
        return "exams";
    }

    async load() {
        try {
            const data = await restClient.get(`${this.items_name()}/`, this.state.query);
            data.items = data.items.map(item => {
                return {...item, _selected: false}
            });
            this.setState({ data });
        } catch(err) {
            this.Page.flashCatch(err);
        }
    }

    toggleItem(item) {
        const items = this.state.data.items.map(it => {
            return it._id === item._id
            ? {...it, _selected: !it._selected}
            : it;});
        this.setState({data: {...this.state.data, items }});
    }

    extendLimit() {
        let _limit = this.state.query._limit;
        if (_limit) {
            _limit += 10;
            let query = {...this.state.query, _limit}
            this.setState({ query }, () => this.load());
        }
    }

    toggleSort(name) {
        if ( this.state.query._sort === name) {
            let _direction = null;
            if (this.state.query._direction === 1) _direction = -1;
            else if (this.state.query._direction === -1) _direction = 1;
            else throw new RangeError(`invalid value for _direction: ${ this.state.query._direction }`);
            const query = { ...this.state.query, _direction};
            this.setState({ query }, () => this.load());
        } else {
            const _sort = name;
            const _direction = 1;
            const query = {...this.state.query, _sort, _direction};
            this.setState({ query }, () => this.load());
        }
    }

    onFilterChange(e) {
        let query = {...this.state.query};
        if (e.target.value === '') {
            delete query[e.target.name];
        } else {
            query[e.target.name] = e.target.value;
        }
        this.setState({ query }, () => this.load());
    }

    onFilterRemoveField(field) {
        let query = {...this.state.query};
        delete query[field];
        this.setState({query}, () => this.load());
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
                        { this.state.data === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento esami...</LoadingMessage></td></tr>
                            : this.state.data.items.map(item => 
                                <ExamRow 
                                    key={ item._id } 
                                    item={ item } 
                                    onToggle={() => {this.toggleItem(item)}}
                                    href={`${this.props.root}exams/view/${item.id}`}
                                    />)
                        }
                        </tbody>
                    </table>
                    { this.state.data && 
                            <p>
                            {this.state.data.items.length < this.state.data.total 
                            ? <button className="btn btn-primary mx-auto d-block" onClick={this.extendLimit.bind(this)}>
                                Carica più righe (altri {`${this.state.data.total - this.state.data.items.length} / ${this.state.data.total}`} da mostrare)
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

function ExamRow({ item, onToggle, href }) {
    return <tr style={item._selected ? {background: "lightgray"} : {}}>
    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ onToggle }/></td>
    <td><a href={ href }>{ item.name }</a></td>
    <td>{ item.tags }</td>
    <td>{ item.code }</td>
    <td>{ item.sector }</td>
    <td>{ item.credits }</td>
</tr>
}