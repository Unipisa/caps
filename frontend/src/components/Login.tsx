import React from "react"
import { Button } from 'react-bootstrap'

import { useEngine } from '../modules/engine'
import Flash from "../components/Flash"

export default function Login({}) {
    const engine = useEngine()

    if (!engine) return null

    return <div className="container">
        <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-6 col-md-9">
                <div className="card o-hidden border-0 shadow-lg my-5">
                    <div className="card-body p-0">
                        <div className="row">
                            <div className="col-lg-12">
                                <div className="p-5">
                                    <div className="d-flex justify-content-between mb-4">
                                        <img src="/img/cherubino_black.png" height="60" className="my-auto" />
                                        <div>
                                            <h1 className="h3 my-auto font-weight-bold text-gray-900">CAPS <span className="text-muted h6">v2.12.2</span></h1>
                                            <h6>Compilazione Assistita<br />Piani di Studio</h6>
                                        </div>

                                    </div>
                                    <div className="text-center">
                                    </div>

                                    <Flash messages={ engine.state.flashMessages } onClick={ () => engine.hideFlash() }></Flash>

                                    <div className="card">
                                        <UnipiLogin />
                                        <LocalLogin />
                                    </div>                                   
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

function UnipiLogin({}) {
    const engine = useEngine()

    return <div className="card mb-4">
        <div className="card-header">
            Credenziali di Ateneo
        </div>
        <div className="card-body">
            <p>Effettua il login usando le credenziali di Ateneo.</p>
            <Button onClick={() => engine?.start_oauth2()}><i className="fas fa-key mr-2" /> Login</Button>
        </div>
    </div>
}

function LocalLogin({}) {
    const engine = useEngine()
    const [username, setUsername] = React.useState("")
    const [password, setPassword] = React.useState("")
    return <>
        <div className="card-header"  data-toggle="collapse" role="button" aria-expanded="false" aria-controls="local-login">
            <div className="d-flex flex-row">
                <i className="mr-3 mt-auto mb-auto fa fa-chevron-down"></i>
                <div>Credenziali locali</div>
            </div>
        </div>
        <div id="local-login" className="collapse">
            <div className="card-body">
                    <div className="input form-group">
                        <label htmlFor="username">Username</label>
                        <input className="form-control" type="text" value={username} onChange={evt => setUsername(evt.target.value)} id="username"/>
                    </div>
                    <div className="input form-group">
                        <label htmlFor="password">Password</label>
                        <input className="form-control" type="password" value={password} onChange={evt => setPassword(evt.target.value)} id="password" autoComplete="off" />
                    </div>
                    <div>
                        <small className="form-text text-muted mb-2">
                            Le credenziali locali sono disponibili solo per gli utenti 
                            creati manualmente sul server. 
                        </small>
                        <input type="submit" onClick={login} className="btn btn-primary mr-auto" value="Login"/>
                    </div>
            </div>
        </div>
    </>

    async function login() {
        try {
            await engine?.login(username, password)
        } catch(err) {
            console.error(err)
        }
    }
}