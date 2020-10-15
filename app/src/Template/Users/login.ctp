<?php
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
    <link href="css/style.min.css" rel="stylesheet">
    <?php echo $this->Html->script('caps') ?>
</head>

<body class="bg-gradient-primary">

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
                                    <img src="img/cherubino_black.png" height="60" class="my-auto">
                                    <div>
                                        <h1 class="h3 my-auto font-weight-bold text-gray-900">CAPS <span class="text-muted h6">v<?= $capsShortVersion ?></span></h1>
                                        <h6>Compilazione Assistita<br>Piani di Studio</h6>
                                    </div>

                                </div>
                                <div class="text-center">
                                </div>
                                <?php echo $this->Flash->render(); ?>
                                <p>Effettua il login usando le credenziali di Ateneo.</p>
                                <?php
                                    echo $this->Form->create(null, [ 'class' => 'user' ]);
                                    echo $this->Form->control('username');
                                    echo $this->Form->control('password');
                                    echo $this->Form->submit('Login');
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

</body>

</html>
