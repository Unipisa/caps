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
<div class="dropdown mr-2">
    <button class="btn btn-primary btn-sm dropdown-toggle" data-toggle="dropdown">
        <i class="fas fa-filter"></i><span class="ml-2 d-none d-md-inline">Filtra</span>
    </button>
    <div class="dropdown-menu p-2" style="width: 350px;">
        <?php
        echo $this->Form->create($filterForm, ['type' => 'GET', 'class' => 'filterForm']);
        foreach ($items as $field => $options) {
            if (!is_array($options)) {
                $options = [
                    'label' => $options
                ];
            }
            $options['onchange'] = 'this.form.submit()';
            echo $this->Form->control($field, $options);
        }
        echo $this->Form->end();
        ?>
    </div>
</div>
