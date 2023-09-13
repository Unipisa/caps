import React from 'react'
import { Link } from "react-router-dom"
import { Button } from 'react-bootstrap'
import { useEngine } from '../modules/engine'


export default function TopBar() {
    const engine = useEngine()
    return <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">

    
    <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
        <svg className="svg-inline--fa fa-bars fa-w-14" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="bars" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z"></path></svg>
    </button>

        <div className="rounded text-primary border-left-warning px-2 py-1 my-auto text-sm-left text-wrap">
            <p>Messaggio pinco pallino</p>    
        </div>
    
    <ul className="navbar-nav ml-auto">

        <div className="d-none d-md-block nav-item my-auto">
            <img src="/img/logo_blue_small.png" alt=""/>        
        </div>

        
            <div className="topbar-divider d-none d-sm-block"></div>

            
            <li className="nav-item dropdown no-arrow">
                <Link className="nav-link dropdown-toggle text-primary" to="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <span className="mr-2 d-none d-lg-inline text-primary small">{ engine.user.name }</span>
                    <svg className="svg-inline--fa fa-user fa-w-14 fa-lg mx-2" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
                </Link >
                
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <div className="dropdown-item">
                        Collegato come <strong>{ engine.user.username }</strong> 
                        { engine.user.admin? " (amministratore)" : "" }
                    </div>
                    <div className="dropdown-divider" />
                        <Link className="dropdown-item" to={`/users/${engine.user._id}`}>
                            <svg className="svg-inline--fa fa-user fa-w-14 fa-sm fa-fw mr-2 text-gray-400" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>
                            I miei documenti
                        </Link >
                        <div className="dropdown-divider" />
                            <Button className="dropdown-item" onClick={engine.logout}>
                                <svg className="svg-inline--fa fa-user fa-w-14 fa-lg mx-2" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg="">
                                    <path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path>
                                </svg>Logout
                            </Button>
                    </div>
            </li>
        
    </ul>
</nav>
}
