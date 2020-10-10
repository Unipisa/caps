<h1>Gruppi</h1>

<?= $this->element('card-start') ?>
    <div class="d-flex mb-2">
        <a href="<?= $this->Url->build([ 'action' => 'edit' ]); ?>" class="mr-2">
            <button type="button" class="btn btn-sm btn-primary">
                Aggiungi gruppo
            </button>
        </a>

        <button type="button" class="btn btn-sm btn-danger"
            onclick="Caps.submitForm('groups-form', { 'delete': 1 }, 'Confermi di voler rimuovere i gruppi selezionati?')">
            Elimina i gruppi selezionati
        </button>

    </div>

    <?php echo $this->Form->create(null, [ 'id' => 'groups-form' ]); ?>
    <table class="table">
        <tr>
            <th></th>
            <th>Nome</th>
            <th>Numerosità</th>
            <th>Esami</th>
        </tr>
        <?php foreach ($groups as $group): ?>
            <tr>
                <td class="caps-admin-groups-id"><input type=checkbox name="selection[]" value="<?php echo $group['id']; ?>"></td>
                <td class="caps-admin-groups-name">
                    <?php
                    echo $this->Html->link(
                        $group['name'],
                        [   'action' => 'view',
                            $group['id']]
                    );
                    ?>
                </td>
                <td class="caps-admin-groups-number">
                    <?php echo count($group['exams']); ?>
                </td>
                <td class="caps-admin-groups-exams">
                    <?php echo $group->shortExamList(); ?>
                </td>
            </tr>
        <?php endforeach ?>
        <?php unset($group) ?>
    </table>
    <?php echo $this->Form->end(); ?>
<?= $this->element('card-end') ?>

