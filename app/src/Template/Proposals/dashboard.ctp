<script>

let monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Construct the labels for the axes
let now = new Date();
let labels = [];
for (let i = 0; i < 12; i++) {
    let thisMonth = now.getMonth();
    labels.unshift(monthNames[thisMonth] + " " + now.getFullYear());
    now.setMonth(thisMonth - 1); // This wraps automatically at the change of year
}

let submissionCounts = [ <?= implode(',',  $submission_counts) ?> ];

function drawCharts(labels, data) {
    // Area Chart Example
    var ctx = document.getElementById("SubmissionCharts");
    var myLineChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: "Sottomissioni-",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: data,
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
                display: false
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
                        return datasetLabel + tooltipItem.yLabel;
                    }
                }
            }
        }
    });
}

jQuery(document).ready(() => {
    drawCharts(labels, submissionCounts);
});
</script>

<h1>Pannello di controllo</h1>

<div class="row">
    <div class="col-xl-4 col-md-4 mb-4">
        <div class="card shadow border-left-warning">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <a href="<?= $this->Url->build([ 'action' => 'index' ]) ?>">
                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Piani da valutare</div>
                        </a>
                        <div class="h5 mb-0 font-weight-bold text-gray-800"><?= $submitted_count ?></div>
                    </div>
                    <div class="col-auto"><a href="<?= $this->Url->build([
                            'controller' => 'proposals',
                            'action' => 'index',
                            '?' => [ 'state' => 'submitted' ]
                        ], [ 'escape' => false ]) ?>">
                            <button type="button" class="btn btn-sm btn-primary">
                                <i class="fas fa-angle-double-right mr-2"></i>Visualizza
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div class="col-xl-4 col-md-4 mb-4">
        <div class="card shadow border-left-warning">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">Piani in attesa di parere</div>
                        <div class="h5 mb-0 font-weight-bold text-gray-800">
                            <?= $proposal_comments->count() ?>
                        </div>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-comment fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-4 mb-4">
        <div class="card shadow border-left-primary">
            <div class="card-body">
                <div class="row no-gutters align-items-center">
                    <div class="col mr-2">
                        <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">Sottomissioni</div>
                        <div class="h5 mb-0 text-gray-800">Mese corrente: <strong><?= $submission_counts[11] ?></strong></div>
                        <div class="h5 mb-0 text-gray-800">Ultimi 12 mesi:
                            <strong>
                                <?= array_reduce($submission_counts, function($a,$b) { return $a + $b; }, 0) ?></div>
                        </strong>
                    </div>
                    <div class="col-auto">
                        <i class="fas fa-file fa-2x text-gray-300"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<div class="row">
    <div class="col-xl-6 col-md-12">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h2 class="h5 mb-0">Piani sottomessi</h2>
            </div>
            <div class="card-body">
                <div class="chart-area">
                    <canvas id="SubmissionCharts"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-6 col-md-12">
        <div class="card shadow">
            <div class="card-header bg-warning">
                <h2 class="h5 text-black-50 mb-0">Piani in attesa di parere</h2>
            </div>
            <div class="card-body">
                <div>
                <table class="table">
                    <thead>
                    <tr>
                        <th>Studente</th>
                        <th>Curriculum</th>
                        <th>Inviata</th>
                        <th></th>
                    </tr>
                    </thead>
                    <?php foreach ($proposal_comments as $pc): ?>
                    <tr>
                        <td>
                            <a href="<?= $this->Url->build([ 'controller' => 'users', 'action' => 'view', $pc['user']['id'] ]) ?>">
                            <?= $pc['user']['name'] ?>
                            </a>
                        </td>
                        <td><?= $pc['curriculum']['name'] ?></td>
                        <td><?= $this->Time->timeAgoInWords($pc['req_date'], [ 'accuracy' => 'day'] ); ?></td>
                        <td><button type="button" class="btn btn-sm btn-primary">
                            <i class="fas fa-eye mr-2"></i>Visualizza
                            </button>
                        </td>
                    </tr>

                    </div>
                <?php endforeach; ?>
                </table>
            </div>
        </div>
    </div>
</div>
