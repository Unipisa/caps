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
<div class="row d-flex">
    <div class="flex-fill"></div>
    <div class="col-auto">
        <nav aria-label="Page navigation">
            <ul class="pagination">
                <?php echo $this->Paginator->prev(
                    'Previous',
                    [ 'class' => 'page-item' ]
                ); ?>
                <?php echo $this->Paginator->numbers(); ?>
                <?php echo $this->Paginator->next(
                    'Next',
                    [ 'class' => 'page-item' ]
                ); ?>
            </ul>
        </nav>
    </div>
    <div class="flex-fill"></div>
</div>
