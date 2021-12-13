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

namespace App\Command;

use Cake\Console\Arguments;
use Cake\Console\Command;
use Cake\Console\ConsoleIo;
use Cake\Console\ConsoleOptionParser;
use App\Model\Entity\User;

class GrantAdminCommand extends Command {

    public function initialize() : void
    {
        parent::initialize();
        $this->loadModel('Users');
    }

    protected function buildOptionParser(ConsoleOptionParser $parser) : ConsoleOptionParser
    {
        $parser->addArgument('username', [
            'help' => 'Username of the selected user'
        ]);

        $parser->addOption('force', [
            'boolean' => true,
            'default' => false,
            'help' => 'Create user even if not existing'
        ]);

        $parser->addOption('password', [
            'default' => null,
            'required' => false,
            'help' => 'Set/change password'
        ]);
        
        return $parser;
    }
    
    public function execute(Arguments $args, ConsoleIo $io)
    {
        $username = $args->getArgument('username');
        $password = $args->getOption('password');
        
        $users = $this->Users->find()->where([ 'username' => $username ]);
        
        if ($users->count() == 0)
        {
            $io->error("User '$username' not found in the database!");
            $io->info("This may mean that the user has never logged in.");
            if ($args->getOption('force')) {
                $user = new User;
                //$user = $this->Users->newEntity();
                $user['username'] = $username;
                $user['name'] = $username;
                $user['givenname'] = '';
                $user['surname'] = $username;
                $user['number'] = '000000';
                if ($this->Users->save($user)) {
                    $io->info("New user $username created");
                } else {
                    $io->error("Creation of new user failed");
                }
            } else {
                $io->info("You can use the flag '--force' to create a new user with the given username.");
                $user = null;
            }
        }
        else
        {
            $user = $users->first();
        }   

        if ($user) {
            $user['admin'] = true;
            if ($args->getOption('password')) {
                $user['password'] = $password;
                $io->info("password set");
            }
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
