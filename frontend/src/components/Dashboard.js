'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import LoadingMessage from './LoadingMessage';
import CapsPage from './CapsPage';

class Dashboard extends CapsPage {
    constructor(props) {
        super(props);
    }
    renderPage() {
        return <>
            <h1>Pannello di controllo</h1>
<div className="row">
    <div className="col-xl-3 col-md-6 mb-4">
        <div className="card shadow border-left-warning">
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <a href="<?= $this->Url->build([ 'action' => 'index' ]) ?>">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Piani da valutare</div>
                        </a>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">{ this.props.data.submitted_count }</div>
                    </div>
                    <div className="col-auto"><a href={`${this.props.root}/proposals?state=submitted`}>
                            <button type="button" className="btn btn-sm btn-primary">
                                <i className="fas fa-angle-double-right mx-2"></i>
                                <span className="d-none d-lg-inline">Visualizza</span>
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div className="col-xl-3 col-md-6 mb-4">
        <div className="card shadow border-left-warning">
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Piani in attesa di parere</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                            { this.props.data.proposal_comments.length }
                        </div>
                    </div>
                    <div className="col-auto">
                        <i className="fas fa-comment fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div className="col-xl-3 col-md-6 mb-4">
        <div className="card shadow border-left-primary">
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Piani inviati</div>
                        <div className="h5 mb-0 text-gray-800">Mese corrente: 
                            <strong>
                            <span id="current-month-proposal-submission-count"></span>
                            </strong>
                        </div>
                        <div className="h5 mb-0 text-gray-800">Ultimi 12 mesi:
                            <strong>
                                <span id="current-year-proposal-submission-count"></span>
                            </strong>
                        </div>
                    </div>
                    <div className="col-auto">
                        <i className="fas fa-file fa-2x text-gray-300"></i>
                    </div>
                </div>
                
            </div>
        </div>
    </div>

    <div className="col-xl-3 col-md-6 mb-4">
        <div className="card shadow border-left-primary">
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">Moduli inviati</div>
                        <div className="h5 mb-0 text-gray-800">Mese corrente: 
                            <strong>
                            <span id="current-month-form-submission-count"></span>
                            </strong>
                        </div>
                        <div className="h5 mb-0 text-gray-800">Ultimi 12 mesi:
                            <strong>
                                <span id="current-year-form-submission-count"></span>
                            </strong>
                        </div>
                    </div>
                    <div className="col-auto">
                        <i className="fas fa-file fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>


<div className="row">
    <div className="col-xl-6 col-md-12 mb-4">
        <div className="card shadow">
            <div className="card-header bg-primary text-white">
                <h2 className="h5 mb-0">Piani e Moduli inviati</h2>
            </div>
            <div className="card-body">
                <canvas id="SubmissionCharts"></canvas>
            </div>
        </div>
    </div>

    <div className="col-xl-6 col-md-12 mb-4">
        <div className="card shadow">
            <div className="card-header bg-warning">
                <h2 className="h5 text-black-50 mb-0">Piani in attesa di parere</h2>
            </div>
            <div className="card-body">
                <div>
                    {
                    (this.props.data.proposal_comments.length > 0)
                    ? <div className="table-responsive-sm">
                        <table className="table">
                            <thead>
                            <tr>
                                <th>Studente</th>
                                <th>Curriculum</th>
                                <th>Richiesto</th>
                                <th></th>
                            </tr>
                            </thead>
                            { this.props.data.proposal_comments.map(pc =>
                                <tr>
                                    <td>
                                        <a href={`${this.props.root}users/${pc.user_id}`}>
                                        {pc.user_name}
                                        </a>
                                    </td>
                                    <td>{pc.curriculum_name}</td>
                                    <td>{pc.req_date}
                                    </td>
                                    <td>
                                        <a href={`${this.props.root}proposals/${pc.id}`}>
                                        <button type="button" className="btn btn-sm btn-primary">
                                        <i className="fas fa-eye mr-2"></i>Visualizza
                                        </button></a>
                                    </td>
                                </tr>)
                            }
                        </table>
                    </div>
                    : <p>Non ci sono piani in attesa di parere.</p>
                    }
                </div>
            </div>
        </div>
    </div>
</div>
</>       
    }
}

export default Dashboard;
