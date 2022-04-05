'use strict';

import React from 'react';
import Modal from './Modal';
import Flash from "./Flash";
import { extendedRestClient as restClient } from "../modules/api";

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

    flashMessage(message, type="primary") {
        this.setState({
            capsFlash: [...this.state.capsFlash, 
                { type, message }]
        });
    }

    flashSuccess(message) {
        this.flashMessage(message, 'success');
    }

    flashError(message) {
        this.flashMessage(message, 'error');
    }

    flashCatch(error) {
        this.flashError(`${error.name}: ${error.message}`);
    }

    hideFlash() {
        this.setState({ 'capsFlash': [] });
    }

    reportError(msg) {
        console.log(msg);
    }

    async get(path, query) {
        return restClient.get(path, query);
    }

    async delete(path) {
        return restClient.delete(path);
    }

    async post(path, payload) {
        return restClient.post(path, payload);
    }

    async patch(path, payload) {
        return restClient.patch(path, payload);
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
