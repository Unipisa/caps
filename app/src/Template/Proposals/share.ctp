<h1>Richiedi parere</h1>

<div class="row">
    <div class="col">
        <div class="card shadow">
            <div class="card-body">
                <?php
                echo $this->Form->create($proposal_auth);
                echo $this->Form->control(
                    'email',
                    ['label' => 'Email']);
                echo $this->Form->submit('Invia richiesta');

                echo $this->Form->end();
                ?>
            </div>
        </div>
    </div>
</div>


