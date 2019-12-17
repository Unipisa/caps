<nav class="caps-admin-navigation">
    <ul>
        <li <?php
                if ($this->request->params['controller'] == 'curricula' &&
                    $this->request->params['action'] == 'admin_index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Curricula',
                    array(
                        'controller' => 'curricula',
                        'action' => 'admin_index'
                    )
                );
            ?>
        </li>
        <li <?php
                if ($this->request->params['controller'] == 'groups' &&
                    $this->request->params['action'] == 'admin_index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Gruppi',
                    array(
                        'controller' => 'groups',
                        'action' => 'admin_index'
                    )
                );
            ?>
        </li>
        <li <?php
                if ($this->request->params['controller'] == 'exams' &&
                    $this->request->params['action'] == 'admin_index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Esami',
                    array(
                        'controller' => 'exams',
                        'action' => 'admin_index'
                    )
                );
            ?>
        </li>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '←&nbsp;Amministrazione',
                    array(
                        'controller' => 'proposals',
                        'action' => 'admin_todo'
                    ),
                    array('escape' => false)
                );
            ?>
        </li>
    </ul>
</nav>
