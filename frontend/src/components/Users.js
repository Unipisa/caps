'use strict';

import React from 'react';
import settings from '../modules/settings';
import models from '../modules/models';
import Card from './Card';
import LoadingMessage from './LoadingMessage';
import Items from './Items';
import { 
    TableTopButtons, TableTopRightButtons, FilterButton, FilterInput, FilterBadges, 
    ItemAddButton, TableContainer, Table,
    ColumnHeaders, ColumnHeader, MoreLinesButton, 
    CsvDownloadButton, ExcelDownloadButton
    } from './TableElements';

class Users extends Items {
    constructor(props) {
        super(models.User, props);
    }

    render() {
        return <>
            <h1>Utenti</h1>
            <Card>
                <TableTopButtons>
                    <FilterButton onChange={ this.onFilterChange.bind(this) }>
                        <FilterInput name="name" label="nome" value={ this.state.query.name || ""}/>
                    </FilterButton>

                    <ItemAddButton>
                        Aggiungi utente
                    </ItemAddButton>

                    <TableTopRightButtons>
                        <CsvDownloadButton 
                            onClick={ async () => this.setState({csvData: await this.csvData()}) } 
                            csvData={ this.state.csvData }
                            filename="caps-users.csv"
                            />
                        <ExcelDownloadButton />
                    </TableTopRightButtons>
                </TableTopButtons>

                <FilterBadges 
                    query={this.state.query} 
                    onRemoveField={field => this.onFilterRemoveField(field)}
                    />

                <TableContainer>
                    <Table>
                        <ColumnHeaders>
                        </ColumnHeaders>
                        <ColumnHeaders>
                            <ColumnHeader self={this} name="name">Nome</ColumnHeader>
                        </ColumnHeaders>
                        <tbody>
                        { this.state.data === null 
                            ? <tr><td colSpan="4"><LoadingMessage>Caricamento utenti...</LoadingMessage></td></tr>
                            : this.state.data.items.map(item => 
                                <UserRow 
                                    key={ item._id } 
                                    item={ item } 
                                    onToggle={() => {this.toggleItem(item)}}
                                    href={`${settings.root_url}users/view/${item.id}`}
                                    />)
                        }
                        </tbody>                    
                    </Table>
                    <MoreLinesButton data={ this.state.data } onClick={ this.extendLimit.bind(this) } />
                </TableContainer>
            </Card>
    </>
    }

}

export default Users;

function UserRow({ item, onToggle, href }) {
    return <tr style={item._selected ? {background: "lightgray"} : {}}>
    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ onToggle }/></td>
    <td><a href={ href }>{ item.name }</a></td>
</tr>
}