<h1>Curricula</h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <div class="d-flex mb-3">
                    <div class="dropdown">
                        <button type="button" data-toggle="dropdown" class="btn btn-sm btn-secondary dropdown-toggle mr-2">
                            Filtra
                        </button>
                        <div class="dropdown-menu p-2" style="width: 350px">
                            <div id="curriculaFilterFormDiv">
                                <?php
                                echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
                                echo $this->Form->control('name',
                                    [
                                        'label' => __('nome'),
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
                                echo $this->Form->end();
                                ?>
                            </div>
                        </div>
                    </div>

                    <a href="<?= $this->Url->build([ 'action' => 'edit' ]) ?>">
                        <button class="btn btn-sm btn-primary mr-2">
                            Aggiungi Curriculum
                        </button>
                    </a>

                    <div class="flex-fill"></div>

                    <a><button class="btn btn-sm btn-warning mr-2"
                            onclick="Caps.submitForm('curricula-form', { 'clone': 1, 'year': jQuery('#clone-year').val() }, null)">
                        Duplica per un nuovo anno
                    </button></a>

                    <div class="form-inline">
                        <!-- <label for="anno" class="mr-2">Anno dei nuovi curricula: </label> //-->
                        <input type="text" class="form-control form-control-sm" name="year" id="clone-year"/>
                    </div>
                </div>

                <?php echo $this->element('filter_badges'); ?>

                <?php echo $this->Form->create(null, [ 'id' => 'curricula-form' ]); ?>

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

                <?php echo $this->element('pagination'); ?>

                <?php echo $this->Form->end(); ?>
            </div>
        </div>
    </div>
</div>
