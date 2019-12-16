<nav class="caps-add-navigation">
    <ul>
        <li>
            <?php
                echo $this->Html->link(
                    'Aggiungi ' . $this->params['controller'],
                    array(
                        'controller' => $this->params['controller'],
                        'action' => 'admin_add'
                    )
                );
            ?>
        </li>
    </ul>
</nav>
