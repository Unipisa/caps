<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2020 E. Paolini, J. Notarstefano, L. Robol
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
$query_params = $this->request->getQueryParams();

// If given, we filter the parameters based on a whitelist
if (isset($fields)) {
  $query_params = array_filter($query_params, function ($x) use ($fields) {
    return in_array($x, $fields);
  }, ARRAY_FILTER_USE_KEY);
}

?>

<?php if (count($query_params) > 0): ?>

    <div class="d-flex align-left my-2">
        <?php foreach ($query_params as $key => $value): ?>
            <?php if ($value != "" && $key != "page"): ?>
                <a style="cursor: pointer;" onclick="" class="filter-badge-link" 
                    data-badge-key="<?= $key ?>">
                    <span class="filter-badge badge badge-secondary mr-2" 
                          title="Rimuovi il filtro <?= $key ?>: <?= $value ?>"><?= $key ?>: <?= $value ?> X</span>
                </a>
            <?php endif; ?>
        <?php endforeach; ?>
        </a>
    </div>

<?php endif; ?>