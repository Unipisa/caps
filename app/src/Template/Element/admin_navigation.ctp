<nav class="caps-admin-navigation">
    <ul>
        <li <?php if ($selected == 'admin_todo') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;da&nbsp;valutare',
                    array('action' => 'todo'),
                    array('escape' => false)
                );
            ?>
        </li>
        <li <?php if ($selected == 'admin_done') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;approvati',
                    array('action' => 'done'),
                    array('escape' => false)
                );
            ?>
        </li>
        <li <?php if ($selected == 'admin_frozen') echo 'class="selected"'?>>
            <?php
                echo $this->Html->link(
                    'PdS&nbsp;archiviati',
                    array('action' => 'frozen'),
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
