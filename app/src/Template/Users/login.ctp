<h2>Login</h2>

<p>Effettua il login usando le credenziali di ateneo.</p>

<?php
    echo $this->Form->create();
    echo $this->Form->input('username');
    echo $this->Form->input('password');
    echo $this->Form->submit('Login');
    echo $this->Form->end();
?>
