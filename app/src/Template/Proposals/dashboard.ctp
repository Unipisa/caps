<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
?>

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
                                <i class="fas fa-angle-double-right mx-2"></i>
                                <span class="d-none d-lg-inline">Visualizza</span>
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
                        <div class="h5 mb-0 text-gray-800">Mese corrente: 
                          <strong>
                            <span id="current-month-submission-count"></span>
                          </strong>
                        </div>
                        <div class="h5 mb-0 text-gray-800">Ultimi 12 mesi:
                            <strong>
                                <span id="current-year-submission-count"></span>
                            </strong>
                        </div>
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
    <div class="col-xl-6 col-md-12 mb-4">
        <div class="card shadow">
            <div class="card-header bg-primary text-white">
                <h2 class="h5 mb-0">Piani sottomessi e approvati</h2>
            </div>
            <div class="card-body">
                <div class="chart-area">
                    <canvas id="SubmissionCharts"></canvas>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-6 col-md-12 mb-4">
        <div class="card shadow">
            <div class="card-header bg-warning">
                <h2 class="h5 text-black-50 mb-0">Piani in attesa di parere</h2>
            </div>
            <div class="card-body">
                <div>
                  <?php if (count($proposal_comments) > 0): ?>
                    <div class="table-responsive-sm">
                        <table class="table">
                            <thead>
                            <tr>
                                <th>Studente</th>
                                <th>Curriculum</th>
                                <th>Richiesto</th>
                                <th></th>
                            </tr>
                            </thead>
                            <?php foreach ($proposal_comments as $pc): ?>
                            <tr>
                                <td>
                                    <a href="<?= $this->Url->build([ 'controller' => 'users', 'action' => 'view', $pc['user_id'] ]) ?>">
                                    <?= h($pc['user_name']) ?>
                                    </a>
                                </td>
                                <td><?= h($pc['curriculum_name']) ?></td>
                                <td><?= $this->Time->timeAgoInWords($pc['req_date'], [
                                        'accuracy' => 'day',
                                        'format' => 'dd/MM/yyyy'
                                    ] );
                                    ?>
                                </td>
                                <td>
                                    <a href="<?= $this->Url->build([ 'action' => 'view', $pc['id'] ]) ?>">
                                    <button type="button" class="btn btn-sm btn-primary">
                                    <i class="fas fa-eye mr-2"></i>Visualizza
                                    </button></a>
                                </td>
                            </tr>

                            </div>
                        <?php endforeach; ?>
                    </table>
                  <?php else: ?>
                    <p>Non ci sono piani in attesa di parere.</p>
                  <?php endif; // End of if (count($proposal_comments) > 0) ?>
                </div>
            </div>
        </div>
    </div>
</div>
