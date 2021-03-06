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
<li class="card border-left-info mb-2">
    <div class="card-body p-1">
    <?php if ($attachment['comment'] != ""): ?>
        <?= h($attachment['comment']) ?><br>
    <?php endif ?>

    <?php if($attachment['filename'] != null): ?>
        <span
            class="<?= $attachment->isPDF() ? 'pdf-attachment' : '' ?>"
            data-id="<?= $attachment->id ?>"
            data-signature-url="<?=
              $this->Url->build([
                  'controller' => $attachment::$controller_name,
                  'action' => 'signatures',
                  '_ext' => 'json',
                  $attachment->id
              ]);
            ?>"
        >
        <?php
        echo $this->Html->link($attachment['filename'], [
            'controller' => $controller,
            'action' => 'view',
            '_full' => !empty($pdf),
            $attachment['id']
        ]);
        if (!empty($pdf)) { // need to load signatures syncronously
            foreach ($attachment->signatures() as $signature) {
                if ($signature->valid) {
                    echo "<span class=\"badge badge-sm badge-success ml-2 px-2 \">";
                    echo "<i class=\"fas fa-pen-fancy mr-1\"></i>";
                    echo $signature->name;
                    echo "</span>";
                  }
            }
        } 
        ?>
        </span>
        <br>
    <?php endif ?>
    <div class="d-sm-flex align-items-center justify-content-between">
    <div>
    <strong><?php echo property_exists($attachment, 'owner') ? $attachment['owner']['name'] : $attachment['user']['name']; ?></strong>
    <?php if ($attachment['created'] != null): ?>
        — <?php echo $this->Caps->formatDate($attachment['created']); ?>
    <?php endif; ?>
    </div>
    <?php if (($user['admin'] || $user['id'] == $attachment['user_id']) && empty($pdf)): ?>
        <?php echo $this->Form->postLink('Elimina', [
            'controller' => $controller,
            'action' => 'delete',
            $attachment['id']
        ], [
            'class' => 'btn-sm btn-danger',
            'confirm' => 'Cancellare definitivamente il ' . $name . '?',
        ]);  ?>
    <?php endif ?>
    </div></div>
</li>
