<nav class="caps-admin-navigation">
    <ul>
        <li class="caps-admin-link">
            <?php
                echo $this->Html->link(
                    '↑&nbspAnnulla', [
                    // $this->request->referer(),
                        'controller' => $this->request->getParam('controller'),
                        'action' => 'index'
                    ],
                    ['escape' => false]
                );
            ?>
        </li>
    </ul>
</nav>
