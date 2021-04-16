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
    <script type="text/javascript" src="<?= $this->Url->assetUrl($debug ? 'js/caps.js' : 'js/caps.min.js') . '?v=' . $js_hash ?>"></script>
</head>

<body class="bg-primary">

<div class="container">

    <!-- Outer Row -->
    <div class="row justify-content-center">
            <div class="card shadow-lg my-5">
				<div class="card-header br-secondary text-primary">
					<div class="d-flex justify-content-between">
                        <img src="img/cherubino_black.png" height="60" class="my-auto">
						<div>
							<h1 class="h3 my-auto font-weight-bold text-gray-900">CAPS <span class="text-muted h6">v2.1.9</span></h1>
							<h6>Compilazione Assistita<br>Piani di Studio</h6>
						</div>
					</div>
				</div>
                <div class="card-body p-3">
					<?php echo $this->Flash->render(); ?>
					<?php echo $this->fetch('content'); ?>
                </div>
            </div>
    </div>

</div>

</body>

</html>