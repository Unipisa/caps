<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * This program is based on the CakePHP framework, which is released under
 * the MIT license, and whose copyright is held by the Cake Software
 * Foundation. See https://cakephp.org/ for further details.
 */
$controllerName = $this->request->getParam('controller');
$actionName = $this->request->getParam('action');
?>

<!-- Sidebar -->
<ul class="navbar-nav bg-primary sidebar sidebar-dark accordion" id="accordionSidebar">

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

    <?php if ($user): ?>

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
                'controller' => 'proposals', 'action' => 'edit'
            ]); ?>">
                <i class="fas fa-fw fa-plus-square"></i>
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
            <a class="nav-link caps-proposal-link" href="<?= $this->Url->build([
                'controller' => 'proposals',
                'action' => 'index'
            ]) ?>">
                <i class="fas fa-fw fa-file-alt"></i>
                <span>Piani di studio</span>
            </a>
        </li>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
            Configurazione
        </div>

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

        <li class="nav-item<?= $controllerName == 'Users' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'users', 'action' => 'index',
                '?' => ['admin' => 'admin']], [
                    'escape' => false
                ]); ?>">
                <i class="fas fa-fw fa-user"></i>
                <span>Utenti</span>
                </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Settings' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build(['controller' => 'settings', 'action' => 'index']); ?>">
            <i class="fas fa-fw fa-wrench"></i>
            <span>Impostazioni</span>
            </a>
        </li>
    <?php endif; ?>

    <!-- Divider -->
    <hr class="sidebar-divider">
    <li class="nav-item">
        <a class="nav-link" href="mailto:help@dm.unipi.it">
            <i class="fas f-fw fa-at"></i>
            <span>Supporto</span>
        </a>
    </li>

</ul>
<!-- End of Sidebar -->
