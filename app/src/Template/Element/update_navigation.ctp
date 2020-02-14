<nav class="caps-admin-navigation">
    <ul>
        <li <?php
        if ($this->request->getParam('controller') == 'degrees' &&
            $this->request->getParam('action') == 'index')
            echo 'class="selected"'
        ?>>
            <?php
            echo $this->Html->link(
                'C. di Laurea',
                ['controller' => 'degrees',
                    'action' => 'index']
            );
            ?>
        </li>
        <li <?php
                if ($this->request->getParam('controller') == 'curricula' &&
                    $this->request->getParam('action') == 'index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Curricula',
                    ['controller' => 'curricula',
                        'action' => 'index']
                );
            ?>
        </li>
        <li <?php
                if ($this->request->getParam('controller') == 'groups' &&
                    $this->request->getParam('action') == 'index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Gruppi',
                    ['controller' => 'groups',
                        'action' => 'index']
                );
            ?>
        </li>
        <li <?php
                if ($this->request->getParam('controller') == 'exams' &&
                    $this->request->getParam('action') == 'index')
                    echo 'class="selected"'
            ?>>
            <?php
                echo $this->Html->link(
                    'Esami',
                    ['controller' => 'exams',
                        'action' => 'index']
                );
            ?>
        </li>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '←&nbsp;Amministrazione',
                    ['controller' => 'proposals',
                        'action' => 'admin_todo'],
                    ['escape' => false]
                );
            ?>
        </li>
    </ul>
</nav>
