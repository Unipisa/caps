<?php
/**
 * CAPS - Compilazione Assistita Piani di Studio
 * Copyright (C) 2014 - 2021 E. Paolini, J. Notarstefano, L. Robol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */
namespace App\Authentication\Authenticator;

use Authentication\Authenticator\AbstractAuthenticator;
use Authentication\Authenticator\Result;
use Authentication\Authenticator\ResultInterface;
use Cake\Core\Configure;
use Cake\ORM\TableRegistry;
use Psr\Http\Message\ServerRequestInterface;

/**
 * Authenticate a request using the instance-wide administrator Bearer token.
 */
class AdminTokenAuthenticator extends AbstractAuthenticator
{
    /**
     * Check whether a request contains the configured administrator token.
     *
     * This method is also used by the CSRF middleware. Bearer credentials are
     * not ambient browser credentials, so authenticated Bearer requests do not
     * need session-based CSRF protection.
     */
    public static function matchesRequest(ServerRequestInterface $request): bool
    {
        // Reading the environment as a fallback keeps this working in the
        // development container when src/ is mounted over an older image whose
        // config/app.php does not contain the AdminToken configuration yet.
        $configuredToken = (string)Configure::read(
            'AdminToken.token',
            env('CAPS_ADMIN_TOKEN', '')
        );
        $configuredUser = (string)Configure::read(
            'AdminToken.username',
            env('CAPS_ADMIN_TOKEN_USER', '')
        );

        if ($configuredToken === '' || $configuredUser === '') {
            return false;
        }

        $header = $request->getHeaderLine('Authorization');
        if (!preg_match('/^Bearer\s+(\S+)$/', $header, $matches)) {
            return false;
        }

        return hash_equals($configuredToken, $matches[1]);
    }

    /**
     * Authenticate the request and return an ephemeral administrator identity.
     */
    public function authenticate(ServerRequestInterface $request): ResultInterface
    {
        // Check if this is a request that matches the token
        if (!self::matchesRequest($request)) {
            return new Result(null, Result::FAILURE_CREDENTIALS_INVALID);
        }

        $username = (string)Configure::read(
            'AdminToken.username',
            env('CAPS_ADMIN_TOKEN_USER', '')
        );
        $identity = TableRegistry::getTableLocator()->get('Users')
            ->find()
            ->where(['username' => $username])
            ->first();

        if ($identity === null) {
            return new Result(null, Result::FAILURE_IDENTITY_NOT_FOUND);
        }

        // Elevate this identity for this request only. Nothing is persisted.
        $identity->set('admin', true);

        return new Result($identity, Result::SUCCESS);
    }
}
