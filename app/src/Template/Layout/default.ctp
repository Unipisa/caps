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

    <?= $this->element('sidebar'); ?>

    <!-- Content Wrapper -->
    <div id="content-wrapper" class="d-flex flex-column">

        <!-- Main Content -->
        <div id="content">
            <?= $this->element('topbar') ?>

            <!-- Begin Page Content -->
            <div class="container-fluid">
                <?php echo $this->Flash->render(); ?>
                <?php echo $this->fetch('content'); ?>
            </div>
            <!-- /.container-fluid -->
        </div>
        <!-- End of Main Content -->

        <?= $this->element('footer'); ?>
    </div>
    <!-- End of Content Wrapper -->

</div>
<!-- End of Page Wrapper -->

<!-- Scroll to Top Button-->
<a class="scroll-to-top rounded" href="#page-top">
    <i class="fas fa-angle-up"></i>
</a>

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
