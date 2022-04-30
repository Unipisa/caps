'use strict';

import React, { useState } from 'react';
import models from '../modules/models';
import { 
    TableTopButtons, TableTopRightButtons, FilterButton, FilterInput, FilterBadges, 
    ItemAddButton, TableContainer, 
    ColumnHeader,
    CsvDownloadButton, ExcelDownloadButton,
    QueryContext
    } from './TableElements';

function QueryTable({ flashCatch, Model, children }) {
    const [query, setQuery] = useState({});
    return <QueryContext.Provider value={ { query, setQuery } }>
        <p>query: { JSON.stringify(query) }</p>
        <TableTopButtons>
            { children }
        </TableTopButtons>
        <FilterBadges query={ query } setQuery={ setQuery } />
        <TableContainer flashCatch={ flashCatch } Model={ Model } ItemRow={ ExamRow }>
            <ColumnHeader name="name">Nome</ColumnHeader>
            <ColumnHeader name="tags">Tags</ColumnHeader>
            <ColumnHeader name="code">Codice</ColumnHeader>
            <ColumnHeader name="sector">Settore</ColumnHeader>
            <ColumnHeader name="credits">Crediti</ColumnHeader>
        </TableContainer>    
    </QueryContext.Provider>
}

function Exams({ flashCatch }) {
    return <>
        <h1>Esami</h1>
        <QueryTable flashCatch={ flashCatch } Model={ models.Exam }>
            <FilterButton>
                <FilterInput name="name" label="nome" />
                <FilterInput name="code" label="codice" />
                <FilterInput name="sector" label="settore" />
                <FilterInput name="credits" label="crediti" />
            </FilterButton>

            <ItemAddButton>
                Aggiungi esame
            </ItemAddButton>

            <TableTopRightButtons>
                <CsvDownloadButton 
                    self={ this }
                    filename="caps-exams.csv"
                    />
                <ExcelDownloadButton />
            </TableTopRightButtons>
        </QueryTable>
    </>
}

export default Exams;

function ExamRow({ item, data, setData }) {

    function onToggle() {
        const items = data.items.map(it => {
            return it._id === item._id
            ? {...it, _selected: !it._selected}
            : it;});
        setData({...data, items });
    }

    return <tr style={ item._selected ? {background: "lightgray" } : {}}>
    <td><input type="checkbox" checked={ item._selected } readOnly onClick={ onToggle }/></td>
    <td><a href={ new models.Exam(item).view_url() }>{ item.name }</a></td>
    <td>{ item.tags }</td>
    <td>{ item.code }</td>
    <td>{ item.sector }</td>
    <td>{ item.credits }</td>
</tr>
}