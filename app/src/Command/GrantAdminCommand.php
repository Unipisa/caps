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