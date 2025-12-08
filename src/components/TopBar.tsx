'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function TopBar() {
  // TODO: Add user authentication
  const user = { name: 'Test User', username: 'test', admin: true }; // Placeholder

  const handleLogout = () => {
    console.log('logout');
    // TODO: Implement logout
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
      <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <i className="fas fa-bars"></i>
      </button>

      <div className="rounded text-primary border-left-warning px-2 py-1 my-auto text-sm-left text-wrap">
        <p>Messaggio di benvenuto</p>
      </div>

      <ul className="navbar-nav ml-auto">
        <div className="d-none d-md-block nav-item my-auto">
          <Image src="/img/logo_blue_small.png" width={100} height={40} alt="Logo" />
        </div>

        <div className="topbar-divider d-none d-sm-block"></div>

        <li className="nav-item dropdown no-arrow">
          <a className="nav-link dropdown-toggle text-primary" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            <span className="mr-2 d-none d-lg-inline text-primary small">{user.name}</span>
            <i className="fas fa-user fa-lg mx-2"></i>
          </a>

          <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
            <div className="dropdown-item">
              Collegato come <strong>{user.username}</strong>
              {user.admin ? " (amministratore)" : ""}
            </div>
            <div className="dropdown-divider" />
            <Link className="dropdown-item" href="/users/profile">
              <i className="fas fa-user fa-sm fa-fw mr-2 text-gray-400"></i>
              I miei documenti
            </Link>
            <div className="dropdown-divider" />
            <a className="dropdown-item" href="#" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
              Logout
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
}