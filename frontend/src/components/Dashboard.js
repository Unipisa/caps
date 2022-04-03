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

    componentDidMount() {
        updateDashboardData(this.props.data);
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
                        <a href={`${this.props.root}proposals`}>
                        <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">Piani da valutare</div>
                        </a>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">{ this.props.data.submitted_count }</div>
                    </div>
                    <div className="col-auto"><a href={`${this.props.root}proposals?state=submitted`}>
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

/**
 * Loads the data for the Dashboard asynchronously, and display the submission plots 
 * and counts (for current month and year). 
 * 
 * This is done by using the API at /proposals/dashboard_data.json. 
 */
async function updateDashboardData(data) {
    function last(arr) {return arr[arr.length-1]};

    function last_year(arr) {return arr.slice(-12)};


    // fill in the data
    document.getElementById('current-month-proposal-submission-count').innerHTML = last(data.proposal_submission_counts);
    document.getElementById('current-year-proposal-submission-count').innerHTML = last_year(data.proposal_submission_counts).reduce((a, b) => a + b);
    document.getElementById('current-month-form-submission-count').innerHTML = last(data.form_submission_counts);
    document.getElementById('current-year-form-submission-count').innerHTML = last_year(data.form_submission_counts).reduce((a, b) => a + b);

    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Construct the labels for the axes
    let now = new Date();
    let labels = [];
    let n_months = data.proposal_submission_counts.length;
    for (let i = 0; i < n_months; i++) {
        let thisMonth = now.getMonth();
        labels.unshift(monthNames[thisMonth] + " " + now.getFullYear());
        now.setMonth(thisMonth - 1); // This wraps automatically at the change of year
    }

    var ctx = document.getElementById("SubmissionCharts");

    function color_with_alpha(color, alpha) {
        return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
    }

    function dataset(label, color, data) {
        let bg_color = color_with_alpha(color, 0.05);
        let fg_color = color_with_alpha(color, 1);

        return {
            label: label,
            backgroundColor: bg_color,
            borderColor: fg_color,
            pointBackgroundColor: fg_color,
            pointBorderColor: fg_color,
            data: data,
        }
    }

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                dataset("Piani inviati", [78, 115, 223], data.proposal_submission_counts), 
                dataset("Piani approvati", [24, 142, 45], data.proposal_approval_counts),
                dataset("Moduli inviati", [170, 151, 57], data.form_submission_counts),
                dataset("Moduli approvati", [128, 109, 21], data.form_approval_counts)],
        },
        options: {
            maintainAspectRatio: true,
            layout: {
                padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                }
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7
                    }
                }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                }],
            },
            legend: {
                display: true
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 10,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 10,
                callbacks: {
                    label: function (tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + ": " + tooltipItem.yLabel;
                    }
                }
            }
        }
    });
}
