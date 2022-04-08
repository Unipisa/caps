import CapsAppController from './app-controller';

import React from 'react';
import ReactDOM from 'react-dom';
import Proposal from '../components/Proposal';
import Proposals from '../components/Proposals';

class CapsProposalsController extends CapsAppController {
    edit(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <Proposal root={this.root} id={id} csrfToken={params._csrfToken}></Proposal>,
            document.querySelector('#app')
        );
    }

    index(params) {
        var query = params["?"];
        if (query === undefined) {
            query = [];
        }

        if (query === undefined) {
            query = {};
        }

        query = {_limit: 10,... query};

        ReactDOM.render(
            <Proposals
                root={this.root}
                query={query}
                csrfToken={params._csrfToken}></Proposals>,
            document.querySelector('#app')
        );
    }
}

export default CapsProposalsController;
