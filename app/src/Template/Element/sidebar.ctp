<?php
$controllerName = $this->request->getParam('controller');
$actionName = $this->request->getParam('action');
?>

<!-- Sidebar -->
<ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

    <!-- Sidebar - Brand -->
    <a class="sidebar-brand d-flex align-items-center justify-content-center" href="#">
        <div class="sidebar-brand-icon">
            <img src="<?= $this->Url->image('cherubino_white.png'); ?>" class="mx-1"/>
        </div>
        <div class="sidebar-brand-text mx-3">CAPS<sup><?= $capsShortVersion ?></sup></div>
    </a>
    <div class="d-flex justify-content-center">
        <div class="text-white text-uppercase font-weight-bold my-2 mx-2 px-2" style="font-size: 0.7rem;">
            <?= $settings['cds'] ?>
        </div>
    </div>

    <?php if ($user  && !$user['admin']): ?>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
            Piani di studio
        </div>

        <!-- Nav Item  -->
        <li class="nav-item<?= $controllerName == 'Users' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'users', 'action' => 'view', $user['id']
            ]); ?>">
                <i class="fas fa-fw fa-file-alt"></i>
                <span>
                    I miei piani
                </span>
            </a>
        </li>

        <!-- Nav Item - Utilities Collapse Menu -->
        <li class="nav-item">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'proposals', 'action' => 'add'
            ]); ?>">
                <i class="fas fa-fw fa-plus"></i>
                <span>Nuovo piano</span>
            </a>
        </li>

    <?php endif; ?>

    <?php if (isset($user) && $user != null && $user['admin']): ?>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
            Gestione
        </div>

        <li class="nav-item<?= ($controllerName == 'Proposals' && $actionName == 'dashboard') ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'proposals', 'action' => 'dashboard'
            ]); ?>">
                <i class="fas fa-fw fa-tachometer-alt"></i>
                <span>Pannello di controllo</span>
            </a>
        </li>

        <li class="nav-item<?= ($controllerName == 'Proposals' && $actionName != 'dashboard') ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'proposals', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-file-alt"></i>
                <span>Piani di studi</span>
            </a>
        </li>

        <!-- Nav Item - Pages Collapse Menu -->
        <li class="nav-item<?= $controllerName == 'Degrees' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'degrees', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-university"></i>
                <span>Corsi di Laurea</span>
            </a>
        </li>


        <li class="nav-item<?= $controllerName == 'Curricula' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'curricula', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-scroll"></i>
                <span>Curricula</span>
            </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Groups' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'groups', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-toolbox"></i>
                <span>Gruppi</span>
            </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Exams' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'exams', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-tasks"></i>
                <span>Esami</span>
            </a>
        </li>

        <li class="nav-item">
            <?php
              $settingsShow = ($controllerName == 'Settings' || ($controllerName == 'Users' && $actionName == 'index'));
            ?>
            <a class="<?= $settingsShow ? 'nav-link' : 'nav-link collapsed' ?>"
               href="#" data-toggle="collapse" data-target="#collapseUtilities" aria-expanded="true" >
                <i class="fas fa-fw fa-wrench"></i>
                <span>Impostazioni</span>
            </a>
            <div id="collapseUtilities" class="collapse <?= $settingsShow ? 'show' : '' ?>" aria-labelledby="headingUtilities" data-parent="#accordionSidebar">
                <div class="bg-white py-2 collapse-inner rounded">
                    <!-- <h6 class="collapse-header">Heading</h6> -->
                    <a class="collapse-item <?= ($controllerName == 'Settings') ? 'active' : '' ?>" href="<?= $this->Url->build([
                            'controller' => 'settings', 'action' => 'index'
                        ]); ?>">Generali</a>
                    <a class="collapse-item <?= ($controllerName == 'Users' && $actionName == 'index') ? 'active' : '' ?>" href="<?= $this->Url->build([
                            'controller' => 'users', 'action' => 'index',
                            '?' => [ 'admin' => 'admin' ]
                        ], [
                            'escape' => false
                        ]); ?>">Utenti</a>
                </div>
            </div>
        </li>

    <?php endif; ?>

    <!-- Divider -->
    <hr class="sidebar-divider">
    <li class="nav-item">
        <a class="nav-link" href="mailto:help@dm.unipi.it">
            <i class="fas f-fw fa-question"></i>
            <span>Supporto</span>
        </a>
    </li>

</ul>
<!-- End of Sidebar -->
