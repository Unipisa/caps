'use strict';

import React from 'react';
import CapsPage from './CapsPage';
import restClient from '../modules/api';
import jQuery from 'jquery';

class ItemsBase extends CapsPage {
    constructor(props) {
        super(props);

        const stored_query = JSON.parse(sessionStorage.getItem(`${this.items_name()}-filter`));
        var query = undefined;

        if (window.location.search != '') {
            const urlSearchParams = new URLSearchParams(window.location.search);
            query = Object.fromEntries(urlSearchParams);
            query = {_limit: 10,... query};
        }

        this.state = {
            ...this.state,
            'rows': null,
            'query': query || stored_query || {},
            'total': null
        };
    }

    items_name() {
        assert(false, "customize!");
        return "items";
    }

    item_items_noun() {
        assert(false, "customize!");
        return "oggetto/i";
    }

    async componentDidMount() {
        // await new Promise(r => setTimeout(r, 5000)); // sleep 5
        this.load();
    }

    async componentDidUpdate() {
        jQuery('span.filter-badge').tooltip();
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
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async toggleSort(name) {
        if ( this.state.query._sort == name) {
            let _direction = null;
            if (this.state.query._direction == 'asc') _direction = 'desc';
            else if (this.state.query._direction == 'desc') _direction = 'asc';
            else throw new RangeError(`invalid value for _direction: ${ this.state.query._direction }`);
            const query = { ...this.state.query, _direction};
            await this.setStateAsync({ query });
            this.load();
        } else {
            const _sort = name;
            const _direction = 'asc';
            const query = {...this.state.query, _sort, _direction};
            await this.setStateAsync({ query });
            this.load();
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
        sessionStorage.setItem(`${this.items_name()}-filter`, JSON.stringify(query));
        this.load();
    }

    async onFilterRemoveField(field) {
        let query = {...this.state.query};
        delete query[field];
        await this.setStateAsync({query});
        sessionStorage.setItem(`${this.items_name()}-filter`, JSON.stringify(query));
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

    async shortItemRender(item) {
        console.assert(false, "Customize in derived class");
    }

    async updateItem(item, state, message) {
        try {
            item = await restClient.patch(`${this.items_name()}/${ item.id }`, {state});
            const rows = this.state.rows.map(
                row => { return (row.item.id === item.id
                    ? {...row, item, "selected": false}
                    : row);});
            rows.total = this.state.rows.total;
            this.flashSuccess(<>{ this.shortItemRender(item) } { message }</>);
            this.setStateAsync({rows});
        } catch(err) {
            this.flashCatch(err);
        }
    }

    async deleteItem(item) {
        try {
            await restClient.delete(`${this.items_name()}/${item.id}`);

            // elimina l'oggetto dall'elenco
            let prev_length = this.state.rows.length;
            const rows = this.state.rows.filter(row => (row.item.id !== item.id));
            rows.total = this.state.rows.total + rows.length - prev_length;

            this.flashMessage(<> {this.shortItemRender(item)} eliminato.</>);
            this.setState({ rows });
        } catch(err) {
            this.flashCatch(err);
        }

    }

    toggleItem(item) {
        const rows = this.state.rows.map(row => {
            return row.item.id === item.id
            ? {...row, "selected": !row.selected}
            : row;});
        rows.total = this.state.rows.total;
        this.setState({rows});
    }

    updateRows(state, message) {
        this.state.rows.forEach(row => {
            if (row.selected) this.updateItem(row.item, state, message);
        });
    }

    countSelected() {
        return this.state.rows.filter(row => row.selected).length;
    }

    async approveSelected() {
        if (await this.confirm("Confermi approvazione?", 
            `Vuoi approvare ${this.countSelected()} ${this.item_items_noun()} selezionati?`)) {
            this.updateRows("approved", "approvato");
        }
    }

    async rejectSelected() {
        if (await this.confirm("Confermi rifiuto?", 
            `Vuoi rifiutare ${this.countSelected()} ${this.item_items_noun()} selezionati?`)) {
            this.updateRows("rejected", "respinto");
        }
    }

    async resubmitSelected() {
        if (await this.confirm("Riporta in valutazione?", 
            `Vuoi risottomettere ${this.countSelected()} ${this.item_items_noun()} selezionati?`)) {
            this.updateRows("submitted", "riportato in valutazione"); 
        }    
    }

    async redraftSelected() {
        if (await this.confirm("Riporta in bozza?", 
            `Vuoi riportare in bozza ${this.countSelected()} ${this.item_items_noun()} selezionati?`)) {
                this.updateRows("draft", "riportato in bozza");
        }
    }

    async deleteSelected() {
        if (await this.confirm("Confermi cancellazione?", 
            `Vuoi rimuovere ${this.countSelected()} ${this.item_items_noun()} selezionati?`)) {

                // delete selected forms one by one
                this.state.rows.forEach(row => {
                    if (row.selected) this.deleteItem(row.item);
                });
            }
    }

    async downloadSelected() {
        this.state.rows.forEach(row => {
            if (row.selected) {
                const item = row.item;
                const url = `${this.props.root}${this.items_name()}/pdf/${item.id}`;
                // We create an <a download href="..."> element, which forces 
                // the file to be downloaded and not opened in a new tab. 
                const el = document.createElement('a');
                el.href = url; el.download = "1"; el.click();
            }
        });
    }

    // compose user friendly column name
    csv_label_for_key(key) {
        let label = key;
        label = label.replaceAll('.', ' ');
        label = label.replaceAll('_', ' ');
        return label;
    }

    async csvData() {
        try {
            let query = {...this.state.query};

            // carica tutti i dati, rimuovi "limit"
            // ma mantieni eventuali filtri (e ordinamento)
            delete query._limit;
            const data = await restClient.get(`${this.items_name()}/`, query);

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

            data.forEach(item => addKeys("", item));

            keys.sort();

            const headers = (keys.map(key => { return {
                    label: this.csv_label_for_key(key),
                    key }}));

            return {headers, data};
        } catch(err) {
            this.flashCatch(err);
        }
    }
}

export default ItemsBase;
