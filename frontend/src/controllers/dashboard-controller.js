import CapsAppController from './app-controller';
import Chart from 'chart.js';

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

    // We fill in the data
    document.getElementById('current-month-submission-count').innerHTML = data.proposal_submission_counts[11];
    document.getElementById('current-year-submission-count').innerHTML = data.proposal_submission_counts.reduce((a, b) => a + b);

    let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Construct the labels for the axes
    let now = new Date();
    let labels = [];
    for (let i = 0; i < 12; i++) {
        let thisMonth = now.getMonth();
        labels.unshift(monthNames[thisMonth] + " " + now.getFullYear());
        now.setMonth(thisMonth - 1); // This wraps automatically at the change of year
    }

    var ctx = document.getElementById("SubmissionCharts");

    function make_color(color, alpha) {
        return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + alpha + ")";
    }

    function dataset(label, color, data) {
        let bg_color = make_color(color, 0.05);
        let fg_color = make_color(color, 1);

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
                dataset("Moduli inviati", [78, 115, 223], data.form_submission_counts),
                dataset("Moduli approvati", [24, 142, 45], data.form_approval_counts)],
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
