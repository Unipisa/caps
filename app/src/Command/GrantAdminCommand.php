<?php

namespace App\Command;

use Cake\Console\Arguments;
use Cake\Console\Command;
use Cake\Console\ConsoleIo;
use Cake\Console\ConsoleOptionParser;

class GrantAdminCommand extends Command {

    public function initialize()
    {
        parent::initialize();
        $this->loadModel('Users');
    }

    protected function buildOptionParser(ConsoleOptionParser $parser)
    {
        $parser->addArgument('username', [
            'help' => 'Username of the selected user'
        ]);
        
        return $parser;
    }
    
    public function execute(Arguments $args, ConsoleIo $io)
    {
        $username = $args->getArgument('username');
        
        $users = $this->Users->find()->where([ 'username' => $username ]);
        
        if ($users->count() == 0)
        {
            $io->error("User $username not found in the database!");
            $io->info("This may mean that the user has never logged in.");
            $io->info("A user can be granted administrator rights only after the first login.");
        }
        else
        {
            $user = $users->first();
            $user['admin'] = true;
            if (! $this->Users->save($user))
            {
                $io->error("Database error while saving user $username.");
            }
            else
            {
                $io->success("The user $username has been granted administrator rights.");
            }
        }   
    }
}
