<h2>Login</h2>

<p>Effettua il login usando le credenziali di ateneo.</p>

<?php
    echo $this->Form->create();
    echo $this->Form->control('username');
    echo $this->Form->control('password');
    echo $this->Form->submit('Login');
    echo $this->Form->end();
?>
