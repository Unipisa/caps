<nav class="caps-admin-navigation">
    <ul>
        <li <?php if ($selected == 'todo') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;da&nbsp;valutare',
                    array('action' => 'adminTodo'),
                    array('escape' => false)
                );
            ?>
        </li>
        <li <?php if ($selected == 'done') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;approvati',
                    array('action' => 'adminDone'),
                    array('escape' => false)
                );
            ?>
        </li>
        <li <?php if ($selected == 'frozen') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;archiviati',
                    array('action' => 'adminFrozen'),
                    array('escape' => false)
                );
            ?>
        </li>
        <li class="caps-update-link">
            <?php
                echo $this->Html->link(
                    'Aggiornamento&nbsp;→',
                    array(
                        'controller' => 'curricula',
                        'action' => 'admin_index'
                    ),
                    array('escape' => false)
                );
            ?>
        </li>
    </ul>
</nav>
