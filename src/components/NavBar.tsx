'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Nav, NavItem } from 'react-bootstrap';
import { usePathname } from 'next/navigation';

export default function NavBar() {
  // TODO: Add user authentication and admin check
  const isAdmin = true; // Placeholder
  const pathname = usePathname();

  return (
    <Nav className="navbar-nav sidebar sidebar-dark accordion" id="accordionSidebar">
      <Link className="sidebar-brand d-flex align-items-center justify-content-center" href="/">
        <div className="sidebar-brand-icon">
          <Image src="/img/cherubino_white.png" width={32} height={32} className="mx-1" alt="Logo" />
        </div>
        <div className="sidebar-brand-text mx-3">CAPS<sup>3.0</sup></div>
      </Link>
      <div className="d-flex justify-content-center">
        <div className="text-white text-uppercase font-weight-bold my-2 mx-2 px-2" style={{fontSize: "0.7rem"}}>
          Development
        </div>
      </div>
      <hr className="sidebar-divider" />

      <div className="sidebar-heading">
        Utente
      </div>

      <NavItem className={pathname === '/documents' ? 'active' : ''}>
        <Link className="nav-link" href="/documents">
          <i className="fas fa-file-alt mr-1"></i>
          <span>I miei documenti</span>
        </Link>
      </NavItem>

      <NavItem className={pathname === '/proposals/new' ? 'active' : ''}>
        <Link className="nav-link" href="/proposals/new">
          <i className="fas fa-plus-square mr-1"></i>
          <span>Nuovo piano di studio</span>
        </Link>
      </NavItem>

      <NavItem className={pathname === '/forms/new' ? 'active' : ''}>
        <Link className="nav-link" href="/forms/new">
          <i className="fas fa-edit mr-1"></i>
          <span>Nuovo modulo</span>
        </Link>
      </NavItem>

      {isAdmin && (
        <>
          <hr className="sidebar-divider" />

          <div className="sidebar-heading">
            Gestione
          </div>

          <NavItem className={pathname === '/dashboard' ? 'active' : ''}>
            <Link className="nav-link" href="/dashboard">
              <i className="fas fa-tachometer-alt mr-1"></i>
              <span>Pannello di controllo</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/proposals' ? 'active' : ''}>
            <Link className="nav-link" href="/proposals">
              <i className="fas fa-file-alt mr-1"></i>
              <span>Piani di studio</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/forms' ? 'active' : ''}>
            <Link className="nav-link" href="/forms">
              <i className="fas fa-table mr-1"></i>
              <span>Moduli</span>
            </Link>
          </NavItem>

          <hr className="sidebar-divider" />

          <div className="sidebar-heading">
            Configurazione
          </div>

          <NavItem className={pathname === '/degrees' ? 'active' : ''}>
            <Link className="nav-link" href="/degrees">
              <i className="fas fa-university mr-1"></i>
              <span>Corsi di Laurea</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/curricula' ? 'active' : ''}>
            <Link className="nav-link" href="/curricula">
              <i className="fas fa-scroll mr-1"></i>
              <span>Curricula</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/exams' ? 'active' : ''}>
            <Link className="nav-link" href="/exams">
              <i className="fas fa-tasks mr-1"></i>
              <span>Esami</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/form-templates' ? 'active' : ''}>
            <Link className="nav-link" href="/form-templates">
              <i className="fas fa-table mr-1"></i>
              <span>Modelli</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/users' ? 'active' : ''}>
            <Link className="nav-link" href="/users">
              <i className="fas fa-user mr-1"></i>
              <span>Utenti</span>
            </Link>
          </NavItem>

          <NavItem className={pathname === '/settings' ? 'active' : ''}>
            <Link className="nav-link" href="/settings">
              <i className="fas fa-wrench mr-1"></i>
              <span>Impostazioni</span>
            </Link>
          </NavItem>
        </>
      )}

      <hr className="sidebar-divider" />
      <NavItem>
        <a className="nav-link" href="mailto:help@dm.unipi.it">
          <i className="fas fa-at mr-1"></i>
          <span>Supporto</span>
        </a>
      </NavItem>
    </Nav>
  );
}