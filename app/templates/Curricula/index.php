<?php echo $this->element('update_navigation'); ?>

<h2>Curricula</h2>

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

<?php echo $this->Form->create(); ?>
<table>
    <tr>
        <th></th>
        <th><?= $this->Paginator->sort('academic_year', 'Anno'); ?></th>
        <th><?= $this->Paginator->sort('Degrees.name', 'Laurea'); ?></th>
        <th><?= $this->Paginator->sort('name', 'Nome'); ?></th>
    </tr>
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

<div class="caps-admin-actions">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    __('Aggiungi nuovo curriculum'),
                    ['controller' => 'curricula',
                        'action' => 'edit']
                );
            ?>
        </li>
        <li>
            <div class="submit" style="display:inline">
                <input class="yellow" type="submit" name="clone" style="width:70%" value="Duplica i curricula selezionati"/>
            </div>
            <div class="input text" style="display:inline">
                <label for="anno" style="display:inline">Anno</label>
                <input type="text" name="year" style="width:15%;padding:0.5%" id="anno"/>
            </div>
        </li>
        <li>
            <div class="submit"><input class="red" type="submit" name="delete" style="width:100%" onclick="return confirm('Confermi di voler rimuovere i curricula selezionati?')" value="Elimina i curricula selezionati"/></div>
        </li>
    </ul>
</div>
<?php echo $this->Form->end(); ?>
