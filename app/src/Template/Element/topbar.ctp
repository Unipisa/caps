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
?>
<!-- Topbar -->
<nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

    <!-- Sidebar Toggle (Topbar) -->
    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
        <i class="fa fa-bars"></i>
    </button>

    <?php if (trim($settings['disclaimer']) != "" || !$email_configured || $Caps['readonly']): ?>
    <div class="rounded text-primary border-left-warning px-2 py-1 my-auto text-sm-left text-wrap">
        <? if ($Caps['readonly']): ?>
                Modalità sola lettura<?= is_string($Caps['readonly']) ? ": " . $Caps['readonly'] : "" ?><br/>
        <? endif; ?>
        <? if (! $email_configured): ?>
            <strong>Attenzione</strong>: le notifiche e-mail non sono disponibili.
        <? endif; ?>
        <?= $settings['disclaimer'] ?>
    </div>
    <?php endif; ?>

    <!-- Topbar Navbar -->
    <ul class="navbar-nav ml-auto">

        <div class="d-none d-md-block nav-item my-auto">
            <?= $this->Html->image('logo_blue_small.png'); ?>
        </div>

        <?php if ($user): ?>

            <div class="topbar-divider d-none d-sm-block"></div>

            <!-- Nav Item - User Information -->
            <li class="nav-item dropdown no-arrow">
                <a class="nav-link dropdown-toggle text-primary" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span class="mr-2 d-none d-lg-inline text-primary small"><?= $user['name'] ?></span>
                    <i class="fas fa-lg fa-user mx-2"></i>
                </a>
                <!-- Dropdown - User Information -->
                <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <div class="dropdown-item">
                        Collegato come <strong><?= $user['username'] ?></strong> (<?= $user['admin'] ? 'amministratore' : 'studente' ?>)
                    </div>
                    <div class="dropdown-divider"></div>

                    <?php if ($user && !$user['admin']): ?>
                        <a class="dropdown-item" href="<?= $this->Url->build(['controller' => 'users', 'action' => 'view', $user['id']])?>">
                            <i class="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
                            I miei piani
                        </a>
                        <div class="dropdown-divider"></div>
                    <?php endif; ?>
                    <a class="dropdown-item" href="<?= $this->Url->build([ 'controller' => 'users', 'action' => 'logout' ])?>">
                        <i class="fas fa-cogs fa-sm fa-fw mr-2 text-gray-400"></i>
                        Logout
                    </a>
                </div>
            </li>
        <?php endif; ?>

    </ul>

</nav>
<!-- End of Topbar -->
