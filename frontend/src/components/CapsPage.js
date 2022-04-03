'use strict';

import React from 'react';
import Modal from './Modal';
import Flash from "./Flash";
import RestClient from "../modules/api";

/**
 * classe base per le componenti che implementano l'intera pagina
 * per adesso serve solo a implementare una volta per tutte la ModalView per i messaggi di conferma
 * le classi derivate devono implementare il metodo renderPage() al posto di render()
 */

class CapsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            capsFlash: []
        }
        this.modal_ref = React.createRef();
    }

    decorateCatchAndBind(...method_names) {
        let self = this;
        method_names.forEach(method_name => {
            const method = self[method_name];
            const f = async function(...args) {
                try {
                    const result = await method.apply(self, args);
                    return result;    
                } catch(err) {
                    if ( typeof(err) === "string" ) {
                        self.flashError(err);
                    } else {
                        throw err;
                    }    
                }
            }
            self[method_name] = f.bind(self);
        });
    }

    confirm(title, message) {
        return new Promise((resolve) => {
            this.modal_ref.current.show(title, message, resolve);
        }).catch(err => {throw err});
    }

    setStateAsync(state) {
        return new Promise((resolve) => {
          this.setState(state, resolve)
        });
    }    

    flashSuccess(message) {
        this.setState({
            'capsFlash': [...this.state.capsFlash, 
                { 'type': 'success', 'message': message }]
        });
    }

    flashError(message) {
        this.setState({
            'capsFlash': [...this.state.capsFlash,
                { 'type': 'error', 'message': message }]
        });
    }

    hideFlash() {
        this.setState({ 'capsFlash': [] });
    }

    reportError(msg) {
        console.log(msg);
    }

    async get(path, query) {
        const res = await RestClient.get(path, query);

        if (res.code != 200) {
            throw res.message;
        }    

        return res;
    }

    async delete(path) {
        const res = await RestClient.delete(path);

        if (res.code != 200) {
            throw res.message;
        }

        return res;
    }

    async post(path, payload) {
        const res = await RestClient.post(path, payload);        

        if (res.code != 200) {
            throw res.message;
        }

        return res;
    }

    render() {
        return <>
            <Modal ref={this.modal_ref}></Modal>
            <Flash messages={this.state.capsFlash} onClick={this.hideFlash.bind(this)}></Flash>
            <div>  
                {this.renderPage()}
            </div>
        </>;
    }
}

export default CapsPage;
