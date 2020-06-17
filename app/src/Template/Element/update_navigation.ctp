<nav class="caps-admin-navigation">
    <ul>
        <li <?php
        if ($this->request->getParam('controller') == 'Degrees' &&
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
                if ($this->request->getParam('controller') == 'Curricula' &&
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
                if ($this->request->getParam('controller') == 'Groups' &&
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
                if ($this->request->getParam('controller') == 'Exams' &&
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
    </ul>
</nav>
