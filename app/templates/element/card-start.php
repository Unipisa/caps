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
// Parse the options
if (isset($border)) {
    $border_class = " border-left-" . $border;
}
else {
    $border_class = "";
}

if (! isset($background)) {
    $background = "bg-primary";
}
else {
    $background = "bg-" . $background;
}

if (! isset($text)) {
    $text = "text-white";
}
else {
    $text = "text-" . $text;
}

?>
<div class="row my-2"
    <?php if (isset($style)) { echo "style=\"$style\""; } ?>"
    <?php if (isset($id)) { echo "id=\"$id\""; } ?>"
>
    <div class="col">
        <div class="card shadow<?= $border_class ?>">
            <?php
                // We only generate a header if it has been explicitly passed to the variables for this element
            ?>
            <?php if (isset($header)): ?>
            <div class="card-header <?= $background ?> <?= $text ?>">
                <h3 class="h5 mb-0">
                    <?= $header ?>
                </h3>
            </div>
            <?php endif; ?>
            <div class="card-body">