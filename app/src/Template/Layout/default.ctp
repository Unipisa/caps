<?php
/**
 *
 * PHP 5
 *
 * CakePHP(tm) : Rapid Development Framework (http://cakephp.org)
 * Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @copyright     Copyright (c) Cake Software Foundation, Inc. (http://cakefoundation.org)
 * @link          http://cakephp.org CakePHP(tm) Project
 * @package       app.View.Layouts
 * @since         CakePHP(tm) v 0.10.0.1076
 * @license       http://www.opensource.org/licenses/mit-license.php MIT License
 */

$capsDescription = __d('caps_dev', 'Compilazione Assistita Piani di Studio — Matematica');
$cakeDescription = __d('cake_dev', 'CakePHP: the rapid development php framework');

?>
<!DOCTYPE html>
<html>
<head>
	<?php echo $this->Html->charset(); ?>
	<title>
        <?php echo $capsDescription ?>
	</title>
	<?php
		echo $this->Html->meta('icon');

        echo $this->Html->css('cake.generic');
        // echo $this->Html->css('chosen.min');
        echo $this->Html->css('caps.css?v=3');
        echo $this->Html->css('caps.print.css?v=1', array('media' => 'print'));

        echo $this->Html->script('jquery-3.4.1.min');
    ?>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.13.0/css/all.min.css">
</head>
<body>
	<div id="container">
        <div id="header">
            <h1>
                <?php
                    echo $this->Html->link(
                        'Compilazione Assistita<br/>'
												.'Piani di Studio<br/>'
												. $settings['cds'],
                        '/',
                        array(
                            'escape' => false
                        )
                    );
                ?>
            </h1>
            <?php if (isset($user)): ?>
                <ul class="topmenu">
                    <?php if ($user['admin']): ?>
                    <li>
                        <?php
                        echo $this->Html->link('Piani di studio', [
                            'controller' => 'proposals',
                            'action' => 'index'
                        ]);
                        ?>
                    </li>
                    <li>
                        <?php
                        echo $this->Html->link('Aggiornamento dati', [
                            'controller' => 'curricula',
                            'action' => 'index'
                        ]);
                        ?>
                    </li>
                    <li>
                        <?php
                        echo $this->Html->link('Impostazioni', [
                            'controller' => 'settings',
                            'action' => 'index'
                        ]);
                        ?>
                    </li>
                    <?php else: ?>
                    <li>
                        <?php
                          echo $this->Html->link('I miei piani di studio', [
                              'controller' => 'users',
                              'action' => 'view'
                          ]);
                        ?>
                    </li>
                    <li>
                        <?php
                        echo $this->Html->link('Nuovo piano', [
                            'controller' => 'proposals',
                            'action' => 'add'
                        ]);
                        ?>
                    </li>
                    <?php endif; ?>
                </ul>
                <ul class='status'>
                    <li>
                        <?php
                          echo $this->Html->link($user['name'], [ 'controller' => 'users', 'action' => 'login' ]);
                        ?>
                    </li>
                    <li>
                        <?php
                        echo $this->Html->link(
                            'Logout',
                            array(
                                'controller' => 'users',
                                'action' => 'logout'
                            ),
                            array(
                                'class' => 'logout'
                            )
                        );
                        ?>
                    </li>
                </ul>
            <?php endif; ?>
        </div>
	<?php if ($settings['disclaimer'] != null) {?>
		<div class="disclaimer">
		<?php echo $settings['disclaimer']; ?>
		</div>
	<?php } ?>
		<div id="content">
			<?php echo $this->Flash->render(); ?>
			<?php echo $this->fetch('content'); ?>
		</div>
        <div id="footer">
						<p class="attribution">
								Caps version <?php if (isset($capsVersion)) { echo $capsVersion; } ?>
                            —
            <?php
                echo $this->Html->link(
                    $this->Html->image('cake.power.gif', array('alt' => isset($cakeDescription) ? $cakeDescription : "", 'border' => '0')),
                    'http://www.cakephp.org/',
                    array('target' => '_blank', 'escape' => false)
                );
            ?>
					</p>
        </div>
	</div>
    <?php // $this->Js->writeBuffer();
    ?>
    <?php // echo $this->element('sql_dump');
    ?>
</body>
</html>
