<h1>Piani di Studio</h1>

<?php if ($user['admin']): ?>

<div class="row my-2">
    <div class="col-12">
        <div class="card shadow">
            <div class="card-body">
                <div class="row">
                    <div class="col-auto">
                        <div class="dropdown mb-2">
                            <button class="btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropDownFilter"
                                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                Filtra
                            </button>
                            <div class="dropdown-menu shadow px-2 py-2" style="min-width: 350px" aria-labelledby="dropdownMenuButton" id="proposalFilterFormDiv">
                                <div class="row">
                                    <div class="col-12">
                                        <?php echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm form']); ?>
                                        <?php echo $this->Form->control('state',
                                            [
                                                'label' => __('stato'),
                                                'type' => 'select',
                                                'options' => [
                                                    'all' => __('tutti'),
                                                    'draft' => __('bozze'),
                                                    'submitted' => __('da valutare'),
                                                    'approved' => __('approvati'),
                                                    'rejected' => __('rifiutati')
                                                ],
                                                'onchange' => 'this.form.submit()'
                                            ]);
                                        echo $this->Form->control('surname',
                                            [
                                                'label' => __('cognome'),
                                                'onchange' => 'this.form.submit()'
                                            ]);
                                        echo $this->Form->control('academic_year',
                                            [
                                                'label' => __('anno'),
                                                'onchange' => 'this.form.submit()'
                                            ]);
                                        echo $this->Form->control('degree',
                                            [
                                                'label' => __('laurea'),
                                                'onchange' => 'this.form.submit()'
                                            ]);
                                        echo $this->Form->control('curriculum',
                                            [
                                                'label' => __('piano'),
                                                'onchange' => 'this.form.submit()'
                                            ]);
                                        ?>
                                        <?php echo $this->Form->end(); ?>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="dropdown">
                        <button type="button" class="btn btn-sm btn-primary dropdown-toggle" id="dropDownActions"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Azioni
                        </button>
                        <div class="dropdown-menu p-2 shadow" style="width: 450px;">
                            <button class="my-1 btn btn-success" style="width: 100%"
                                    onclick="Caps.submitForm('proposal-form', { 'approve': 1 }, 'Confermi di voler accettare i piani di studio selezionati?');">
                                ✓ Approva i piani di studio selezionati
                            </button>
                            <button class="my-1 btn btn-danger" style="width: 100%"
                                    onclick="Caps.submitForm('proposal-form', { 'reject' : 1 }, 'Confermi di voler rifiutare i piani di studio selezionati?');">
                                ✗ Rifiuta i piani di studio selezionati
                            </button>
                            <button class="my-1 btn btn-warning" style="width: 100%"
                                    onclick="Caps.submitForm('proposal-form', { 'resubmit': 1}, 'Confermi di voler riportare in valutazione i piani di studio selezionati?')">
                                ⎌ Riporta in valutazione i piani di studio selezionati
                            </button>
                            <button class="my-1 btn btn-warning" style="width: 100%"
                                    onclick="Caps.submitForm('proposal-form', { 'redraft': 1 }, 'Confermi di voler riportare in bozza i piani di studio selezionati?')">
                                ⎌ Riporta in bozza i piani di studio selezionati
                            </button>
                            <button class="my-1 btn btn-danger" style="width: 100%"
                                    onclick="Caps.submitForm('proposal-form', { 'delete': 1 }, 'Confermi di voler eliminare i piani di studio selezionati?')">
                                🗑 Elimina i piani di studio selezionati
                            </button>
                        </div>
                    </div>

                    <div class="col-auto">
                        <button type="button" class="btn btn-sm btn-primary" onclick="Caps.downloadCSV();">
                            <i class="fas fw fa-download mr-2" ></i>Esporta in CSV
                        </button>
                    </div>
                </div>

                <?php endif; ?>

                <?php echo $this->Form->create('', [ 'id' => 'proposal-form' ]); ?>

                <?php echo $this->element('filter_badges'); ?>

                <table class="table">
                    <tr><thead>
                        <th></th>
                        <th><a href="#">Stato</a></th>
                        <th><?= $this->Paginator->sort('Users.surname', 'Nome'); ?></th>
                        <th><?= $this->Paginator->sort('academic_year', 'Anno'); ?></th>
                        <th><?= $this->Paginator->sort('Degress.name', 'Laurea'); ?></th>
                        <th><?= $this->Paginator->sort('Curricula.name', 'Piano di studio'); ?></th>
                        <th></th>
                        </thead>
                    </tr>
                    <?php foreach ($proposals as $proposal): ?>
                        <?php
                        $curriculum = $proposal['curriculum'];
                        ?>
                        <tr>
                            <td class="caps-admin-proposal-id"><input type=checkbox name="selection[]" value="<?php echo $proposal['id']; ?>"></td>
                            <td class="caps-admin-proposal-state">
                                <?php echo $this->Html->link(
                                    $proposal->getStateString(),
                                    ['action' => 'view', $proposal['id']]);
                                ?></td>
                            <td class="caps-admin-proposal-name">
                                <?php echo $this->Html->link(
                                    $proposal['user']['name'],
                                    ['controller' => 'users', 'action' => 'view', $proposal['user']['id']]);
                                ?></td>
                            <td class="caps-admin-proposal-year">
                                <?php
                                echo $curriculum['academic_year'];
                                ?>
                            </td>
                            <td class="caps-admin-proposal-degree">
                                <?php
                                echo $this->Html->link(
                                    $curriculum['degree']['name'],
                                    ['controller' => 'degrees', 'action' => 'view', $curriculum['degree']['id']]
                                );
                                ?>
                            </td>
                            <td class="caps-admin-proposal-pds">
                                <?php
                                echo $this->Html->link(
                                    $curriculum['name'],
                                    ['controller' => 'curricula', 'action' => 'view', $curriculum['id'] ]
                                );
                                ?>
                            </td>
                            <td>
                                <a href="<?= $this->Url->build([ 'controller' => 'proposals', 'action' => 'view', $proposal['id'] ]) ?>">
                                <button type="button" class="btn btn-sm btn-primary">
                                    <i class="fas fa-eye mr-2"></i>Visualizza
                                </button></a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                    <?php unset($proposal); ?>
                </table>

                <?php echo $this->element('pagination'); ?>


                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>

