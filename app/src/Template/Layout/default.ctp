<?php
    $controllerName = $this->request->getParam('controller');
    $actionName = $this->request->getParam('action');
?>
<!DOCTYPE html>
<html lang="en">

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
    <?php echo $this->Html->script('../vendor/jquery/jquery.min'); ?>
    <?php echo $this->Html->css('../vendor/fontawesome-free/css/all.min.css'); ?>
    <?php echo $this->Html->css('sb-admin-2.min.css'); ?>
    <?php echo $this->Html->css('caps'); ?>
    <?php echo $this->Html->script('caps') ?>
</head>

<body id="page-top">

<!-- Page Wrapper -->
<div id="wrapper">

    <!-- Sidebar -->
    <ul class="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">

        <!-- Sidebar - Brand -->
        <a class="sidebar-brand d-flex align-items-center justify-content-center" href="#">
            <div class="sidebar-brand-icon">
                <img src="<?= $this->Url->image('cherubino_white.png'); ?>" class="mx-1"/>
            </div>
            <div class="sidebar-brand-text mx-3">CAPS<sup><?= $capsShortVersion ?></sup></div>
        </a>
        <div class="d-flex justify-content-center">
            <div class="text-white text-uppercase font-weight-bold my-2 mx-2 px-2" style="font-size: 0.7rem;">
                <?= $settings['cds'] ?>
            </div>
        </div>

        <?php if ($user  && !$user['admin']): ?>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
            Piani di studio
        </div>

        <!-- Nav Item  -->
        <li class="nav-item<?= $controllerName == 'Users' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                    'controller' => 'users', 'action' => 'view', $user['id']
                ]); ?>">
                <i class="fas fa-fw fa-file-alt"></i>
                <span>
                    I miei piani
                </span>
            </a>
        </li>

        <!-- Nav Item - Utilities Collapse Menu -->
        <li class="nav-item">
            <a class="nav-link" href="<?= $this->Url->build([
                    'controller' => 'proposals', 'action' => 'add'
                ]); ?>">
                <i class="fas fa-fw fa-plus"></i>
                <span>Nuovo piano</span>
            </a>
        </li>

        <?php endif; ?>

        <?php if (isset($user) && $user != null && $user['admin']): ?>

        <!-- Divider -->
        <hr class="sidebar-divider">

        <!-- Heading -->
        <div class="sidebar-heading">
            Gestione
        </div>

        <li class="nav-item<?= ($controllerName == 'Proposals' && $actionName == 'dashboard') ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'proposals', 'action' => 'dashboard'
            ]); ?>">
                <i class="fas fa-fw fa-tachometer-alt"></i>
                <span>Pannello di controllo</span>
            </a>
        </li>

        <li class="nav-item<?= ($controllerName == 'Proposals' && $actionName != 'dashboard') ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'proposals', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-file-alt"></i>
                <span>Piani di studi</span>
            </a>
        </li>

        <!-- Nav Item - Pages Collapse Menu -->
        <li class="nav-item<?= $controllerName == 'Degrees' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                    'controller' => 'degrees', 'action' => 'index'
                ]); ?>">
                <i class="fas fa-fw fa-university"></i>
                <span>Corsi di Laurea</span>
            </a>
        </li>


        <li class="nav-item<?= $controllerName == 'Curricula' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'curricula', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-scroll"></i>
                <span>Curricula</span>
            </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Groups' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'groups', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-toolbox"></i>
                <span>Gruppi</span>
            </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Exams' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'exams', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-tasks"></i>
                <span>Esami</span>
            </a>
        </li>

        <li class="nav-item<?= $controllerName == 'Settings' ? ' active' : '' ?>">
            <a class="nav-link" href="<?= $this->Url->build([
                'controller' => 'settings', 'action' => 'index'
            ]); ?>">
                <i class="fas fa-fw fa-cog"></i>
                <span>Impostazioni</span>
            </a>
        </li>

        <?php endif; ?>

        <!-- Divider -->
        <hr class="sidebar-divider">
        <li class="nav-item">
            <a class="nav-link" href="mailto:help@dm.unipi.it">
                <i class="fas f-fw fa-question"></i>
                <span>Supporto</span>
            </a>
        </li>

    </ul>
    <!-- End of Sidebar -->

    <!-- Content Wrapper -->
    <div id="content-wrapper" class="d-flex flex-column">

        <!-- Main Content -->
        <div id="content">

            <!-- Topbar -->
            <nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

                <!-- Sidebar Toggle (Topbar) -->
                <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
                    <i class="fa fa-bars"></i>
                </button>

                <!-- Topbar Search, disabled for now  -->
                <!--
                <form class="d-none d-sm-inline-block form-inline mr-auto ml-md-3 my-2 my-md-0 mw-100 navbar-search">
                    <div class="input-group">
                        <input type="text" class="form-control bg-light border-0 small" placeholder="Search for..." aria-label="Search" aria-describedby="basic-addon2">
                        <div class="input-group-append">
                            <button class="btn btn-primary" type="button">
                                <i class="fas fa-search fa-sm"></i>
                            </button>
                        </div>
                    </div>
                </form>
                -->

                <!-- Topbar Navbar -->
                <ul class="navbar-nav ml-auto">
                    <?php if ($user): ?>

                    <div class="topbar-divider d-none d-sm-block"></div>

                    <!-- Nav Item - User Information -->
                    <li class="nav-item dropdown no-arrow">
                        <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <span class="mr-2 d-none d-lg-inline text-gray-600 small"><?= $user['name'] ?></span>
                            <i class="fas fa-lg fa-user ml-2"></i>
                        </a>
                        <!-- Dropdown - User Information -->
                        <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
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

            <!-- Begin Page Content -->
            <div class="container-fluid">
                <?php echo $this->Flash->render(); ?>
                <?php echo $this->fetch('content'); ?>
            </div>
            <!-- /.container-fluid -->

        </div>
        <!-- End of Main Content -->

        <!-- Footer -->
        <footer class="sticky-footer bg-white">
            <div class="container my-auto">
                <div class="copyright text-center my-auto">
                    <span>Copyright &copy; Dipartimento di Matematica &mdash; Università di Pisa &mdash; 2020</span>
                    <div class="mx-4 d-inline"></div>
                    <span>CAPS version <?= $capsVersion ?></span>
                </div>
            </div>
        </footer>
        <!-- End of Footer -->

    </div>
    <!-- End of Content Wrapper -->

</div>
<!-- End of Page Wrapper -->

<!-- Scroll to Top Button-->
<a class="scroll-to-top rounded" href="#page-top">
    <i class="fas fa-angle-up"></i>
</a>

<!-- Logout Modal-->
<div class="modal fade" id="logoutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="exampleModalLabel">Ready to Leave?</h5>
                <button class="close" type="button" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">×</span>
                </button>
            </div>
            <div class="modal-body">Select "Logout" below if you are ready to end your current session.</div>
            <div class="modal-footer">
                <button class="btn btn-secondary" type="button" data-dismiss="modal">Cancel</button>
                <a class="btn btn-primary" href="login.html">Logout</a>
            </div>
        </div>
    </div>
</div>

<!-- Bootstrap core JavaScript-->
<?php echo $this->Html->script('../vendor/bootstrap/js/bootstrap.bundle.min'); ?>

<!-- Core plugin JavaScript-->
<?php echo $this->Html->script('../vendor/jquery-easing/jquery.easing.min'); ?>

<!-- Charts -->
<?php echo $this->Html->script('../vendor/chart.js/Chart.min'); ?>

<!-- Custom scripts for all pages-->
<?php echo $this->Html->script('sb-admin-2.min'); ?>

</body>

</html>
