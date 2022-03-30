import CapsAppController from './app-controller';
import Chart, { scaleService } from 'chart.js';

/**
 * Loads the data for the Dashboard asynchronously, and display the submission plots 
 * and counts (for current month and year). 
 * 
 * This is done by using the API at /proposals/dashboard_data.json. 
 */
async function loadDashboardData() {
    // We fetch the data to display in the plots
    let res = await fetch('/api/v1/dashboard'); // *** TODO: usare la root del server e la libreria apposita per la chiamata
    let data = await res.json();

    // TODO: controllare data.code

    data = data.data;

    function last(arr) {return arr[arr.length-1]};

    function last_year(arr) {return arr.slice(-12)};


    // We fill in the data
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
            maintainAspectRatio: false,
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

class DashboardController extends CapsAppController {
    index(params) {
        loadDashboardData();
    }

}

export default DashboardController;
