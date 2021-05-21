const jQuery = require('jquery');
const Chart = require('chart.js');

/**
 * Loads the data for the Dashboard asynchronously, and display the submission plots 
 * and counts (for current month and year). 
 * 
 * This is done by using the API at /proposals/dashboard_data.json. 
 */
async function loadDashboardData() {
    // We fetch the data to display in the plots
    let res = await fetch('dashboard_data.json');
    let data = await res.json();

    // We fill in the data
    document.getElementById('current-month-submission-count').innerHTML = data.submission_counts[11];
    document.getElementById('current-year-submission-count').innerHTML = data.submission_counts.reduce((a,b) => a + b);

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

    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Sottomissioni",
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                data: data.submission_counts,
            }, {
                label: "Approvazioni",
                pointBorderColor: "rgba(24, 142, 45, 1)",
                borderColor: "rgba(24, 142, 45, 1)",
                backgroundColor: "rgba(24, 142, 45, 0.05)",
                pointBackgroundColor: "rgba(24, 142, 45, 1)",
                data: data.approval_counts,
            }],
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

export { loadDashboardData };