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
                    ['controller' => 'curricula',
                        'action' => 'admin_index']
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
                    ['controller' => 'groups',
                        'action' => 'admin_index']
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
                    ['controller' => 'exams',
                        'action' => 'admin_index']
                );
            ?>
        </li>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '↑&nbspAggiornamento', [
                    // $this->request->referer(),
                        'controller' => $this->request->params['controller'],
                        'action' => 'admin-index'
                    ],
                    ['escape' => false]
                );
            ?>
        </li>
    </ul>
</nav>
