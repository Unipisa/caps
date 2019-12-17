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
        echo $this->Html->css('caps');
        echo $this->Html->css('caps.print', array('media' => 'print'));

        echo $this->Html->script('jquery-1.10.2.min');
        // echo $this->Html->script('chosen.jquery.min');
        if (is_file(WWW_ROOT . 'js' . DS . $this->request->params['controller'] . DS . $this->request->params['action'] . '.js')) {
            echo $this->Html->script($this->request->params['controller'] . '/' . $this->request->params['action']);
        }
	?>
</head>
<body>
	<div id="container">
        <div id="header">
            <h1>
                <?php
                    echo $this->Html->link(
                        'Compilazione Assistita<br/>Piani di Studio<br/>Matematica',
                        '/',
                        array(
                            'escape' => false
                        )
                    );
                ?>
            </h1>
        </div>
		<div id="content">
			<?php echo $this->Flash->render(); ?>
            <?php if (isset($owner)): ?>
                <ul class='status'>
                    <li>
                        <?php echo $owner['User']['name']; ?>
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
			<?php echo $this->fetch('content'); ?>
		</div>
        <div id="footer">
            <p class="attribution">
                Trash Can designed by <a href="http://thenounproject.com/rubensteeman">Ruben Steeman</a> from the <a href="http://www.thenounproject.com/">Noun Project</a>
            </p>
            <?php
                echo $this->Html->link(
                    $this->Html->image('cake.power.gif', array('alt' => $cakeDescription, 'border' => '0')),
                    'http://www.cakephp.org/',
                    array('target' => '_blank', 'escape' => false)
                );
            ?>
        </div>
	</div>
    <?php // $this->Js->writeBuffer(); 
    ?>
    <?php // echo $this->element('sql_dump'); 
    ?>
</body>
</html>
