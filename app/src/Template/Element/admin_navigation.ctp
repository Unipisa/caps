<nav class="caps-admin-navigation">
    <ul>
        <li <?php if ($selected == 'todo') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;da&nbsp;valutare',
                    ['action' => 'adminTodo'],
                    ['escape' => false]
                );
            ?>
        </li>
        <li <?php if ($selected == 'done') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;approvati',
                    ['action' => 'adminDone'],
                    ['escape' => false]
                );
            ?>
        </li>
        <li <?php if ($selected == 'frozen') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;archiviati',
                    ['action' => 'adminFrozen'],
                    ['escape' => false]
                );
            ?>
        </li>
        <li class="caps-update-link">
            <?php
                echo $this->Html->link(
                    'Aggiornamento&nbsp;→',
                    ['controller' => 'curricula',
                        'action' => 'admin_index'],
                    ['escape' => false]
                );
            ?>
        </li>
    </ul>
</nav>
