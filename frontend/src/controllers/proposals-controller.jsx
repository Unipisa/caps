import CapsAppController from './app-controller';

import React from 'react';
import ReactDOM from 'react-dom';
import { ProposalEdit } from '../components/ProposalEdit';
import { ProposalView } from '../components/ProposalView';
import Proposals from '../components/Proposals';

class CapsProposalsController extends CapsAppController {
    edit(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <ProposalEdit root={this.root} id={id} csrfToken={params._csrfToken}></ProposalEdit>,
            document.querySelector('#app')
        );
    }

    view(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        const target = document.querySelector('#app')

        if (target) {
            ReactDOM.render(
                <ProposalView root={this.root} id={id} csrfToken={params._csrfToken}></ProposalView>,
                
            );
        }
    }

    index(params) {
        ReactDOM.render(
            <Proposals
                root={this.root}
                csrfToken={params._csrfToken}></Proposals>,
            document.querySelector('#app')
        );
    }
}

export default CapsProposalsController;
