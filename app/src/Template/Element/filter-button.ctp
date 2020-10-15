<div class="dropdown mr-2">
    <button class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
        Filtra
    </button>
    <div class="dropdown-menu p-2" style="width: 350px;">
        <?php
        echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
        foreach ($items as $field => $options) {
            if (!is_array($options)) {
                $options = [
                    'label' => $options
                ];
            }
            $options['onchange'] = 'this.form.submit()';
            echo $this->Form->control($field, $options);
        }
        echo $this->Form->end();
        ?>
    </div>
</div>
