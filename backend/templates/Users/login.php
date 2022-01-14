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
    $this->setLayout(false);
?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="">
    <meta name="author" content="">

    <title>CAPS</title>

    <!-- Custom fonts for this template-->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,200i,300,300i,400,400i,600,600i,700,700i,800,800i,900,900i" rel="stylesheet">

    <!-- Custom styles for this template-->
    <script type="text/javascript" src="<?= $this->Url->assetUrl('js/' . $this->Caps->jsName()) ?>"></script>
</head>

<body class="bg-primary">

<div class="container">

    <!-- Outer Row -->
    <div class="row justify-content-center">

        <div class="col-xl-6 col-lg-6 col-md-9">

            <div class="card o-hidden border-0 shadow-lg my-5">
                <div class="card-body p-0">
                    <!-- Nested Row within Card Body -->
                    <div class="row">
                        <div class="col-lg-12">
                            <div class="p-5">
                                <div class="d-flex justify-content-between mb-4">
                                    <img src="<?= $this->Url->assetUrl('img/cherubino_black.png') ?>" height="60" class="my-auto">
                                    <div>
                                        <h1 class="h3 my-auto font-weight-bold text-gray-900">CAPS <span class="text-muted h6">v<?= $capsShortVersion ?></span></h1>
                                        <h6>Compilazione Assistita<br>Piani di Studio</h6>
                                    </div>

                                </div>
                                <div class="text-center">
                                </div>
                                <?php echo $this->Flash->render(); ?>

                                

                                <div class="card mb-4">
                                    <div class="card-header">
                                        Credenziali di Ateneo
                                    </div>
                                    <div class="card-body">
                                        <p>Effettua il login usando le credenziali di Ateneo.</p>
                                        <?php if ($oauth2_enabled): ?>
                                            <a class="ml-auto btn btn-primary" href="<?php echo $this->Url->build([ 'controller' => 'users', 'action' => 'oauth2-login' ])?>">
                                            <i class="fas fa-key mr-2"></i> Login
                                            </a>
                                        <?php endif; ?>
                                    </div>
                                </div>

                                <div class="card">
                                    <div class="card-header"  data-toggle="collapse" href="#local-login" role="button" aria-expanded="false" aria-controls="local-login">
                                        <div class="d-flex flex-row">
                                            <i class="mr-3 mt-auto mb-auto fa fa-chevron-down"></i>
                                            <div>Credenziali locali</div>
                                        </div>
                                    </div>
                                    <div id="local-login" class="collapse">
                                        <div class="card-body">
                                            <?php
                                                echo $this->Form->create(null, [ 'class' => 'user' ]);
                                                echo $this->Form->control('username');
                                                echo $this->Form->control('password');
                                            ?>
                                            <div>
                                            <small class="form-text text-muted mb-2">
                                                Le credenziali locali sono disponibili solo per gli utenti 
                                                creati manualmente sul server. 
                                            </small>
                                            <?php
                                                echo $this->Form->submit('Login', [ 'class' => 'mr-auto' ]);    
                                            ?>
                                            </div>
                                            <?php
                                                echo $this->Form->end();
                                            ?>
                                        </div>
                                    </div>
                                </div>


                                   
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>

</div>

</body>

</html>
