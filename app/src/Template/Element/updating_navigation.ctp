<nav class="caps-admin-navigation">
    <ul>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '↑&nbspAnnulla', [
                    // $this->request->referer(),
                        'controller' => $this->request->getParam('controller'),
                        'action' => $this->request->getParam('controller') == 'curricula' ? 'index' : 'admin-index'
                    ],
                    ['escape' => false]
                );
            ?>
        </li>
    </ul>
</nav>
