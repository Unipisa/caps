<h1>Curricula</h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-3">
                    <?= $this->element('filter-button', ['items' => [
                        'name' => __('nome'),
                        'academic_year' => __('anno'),
                        'degree' => __('laurea')]]) ?>

                    <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
                        <button class="btn btn-sm btn-primary mr-2">
                            Aggiungi curriculum
                        </button>
                    </a>

                    <a href="#" >
                        <button class="btn btn-sm btn-danger mr-2" onclick="Caps.submitForm('curricula-form', {'delete' : 1}, 'Eliminare i curricula selezionati?')">
                            Elimina curriculum
                        </button>
                    </a>

                    <div class="flex-fill"></div>

                    <div class="btn btn-sm btn-primary mr-2" type="button" onclick="Caps.downloadCSV()">
                        <i class="fas fa-download mr-2"></i>Esporta in CSV
                    </div>

                    <a><button class="btn btn-sm btn-primary mr-2"
                            onclick="Caps.submitForm('curricula-form', { 'clone': 1, 'year': jQuery('#clone-year').val() }, 'Clonare i nuovi curricula per l\'anno selezionato?')">
                        Duplica per un nuovo anno
                    </button></a>

                    <div class="form-inline">
                        <!-- <label for="anno" class="mr-2">Anno dei nuovi curricula: </label> //-->
                        <input type="text" class="form-control form-control-sm" name="year" id="clone-year"/>
                    </div>
                </div>

                <?php echo $this->element('filter_badges'); ?>

                <?php echo $this->Form->create(null, [ 'id' => 'curricula-form' ]); ?>

                <div class="table-responsive-sm">
                <table class="table">
                    <tr><thead>
                        <th></th>
                        <th><?= $this->Paginator->sort('academic_year', 'Anno'); ?></th>
                        <th><?= $this->Paginator->sort('Degrees.name', 'Laurea'); ?></th>
                        <th><?= $this->Paginator->sort('name', 'Nome'); ?></th>
                    </thead></tr>
                    <?php foreach ($paginated_curricula as $curriculum): ?>
                        <tr>
                            <td class="caps-admin-curricula-id"><input type=checkbox name="selection[]" value="<?php echo $curriculum['id']; ?>"></td>
                            <td class="caps-admin-curricula-year"><?php echo $curriculum['academic_year']; ?></td>
                            <td class="caps-admin-curricula-degree"><?php echo $curriculum['degree']['name']; ?></td>
                            <td class="caps-admin-curricula-name">
                                <?php
                                echo $this->Html->link(
                                    $curriculum['name'],
                                    [   'controller' => 'curricula',
                                        'action' => 'view',
                                        $curriculum['id']]
                                );
                                ?>
                            </td>
                        </tr>
                    <?php endforeach ?>
                    <?php unset($curriculum); ?>
                </table>
                </div>
                <?php echo $this->element('pagination'); ?>

                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>
