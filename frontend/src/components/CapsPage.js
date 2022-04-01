'use strict';

import React, { useState } from 'react';
import Card from './Card';
import RestClient from '../modules/api';
import FilterButton from './FilterButton';
import LoadingMessage from './LoadingMessage';
import FormBadge from './FormBadge';
import Modal from './Modal';

/**
 * classe base per le componenti che implementano l'intera pagina
 * per adesso serve solo a implementare una volta per tutte la ModalView per i messaggi di conferma
 * le classi derivate devono implementare il metodo renderPage() al posto di render()
 */

class CapsPage extends React.Component {
    constructor(props) {
        super(props);
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

    render() {
        return <>
            <Modal ref={this.modal_ref}></Modal>
            <div>  
                {this.renderPage()}
            </div>
        </>;
    }
}

export default CapsPage;
