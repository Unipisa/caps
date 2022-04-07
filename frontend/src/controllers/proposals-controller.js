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

        sessionStorage.setItem('proposals-filter', JSON.stringify(query));

        // At this point we need to rewrite the links that may point to 
        // outdated information. 
        this.updateProposalsURL();

        // Add a callback to the download proposals button
        document.getElementById("proposals-massive-download-button").onclick = this.onDownloadProposalsClicked.bind(this);

        ReactDOM.render(
            <Proposals
                root={this.root}
                query={query}
                csrfToken={params._csrfToken}></Proposals>,
            document.querySelector('#app')
        );
    }

    onDownloadProposalsClicked() {
        const form = document.getElementById("proposal-form");
        const data = new FormData(form);

        // We extract the currently selected IDs, and for each of them 
        // we trigger a download. 
        for (const item of data.entries()) {
            if (item[0] === 'selection[]') {
                const url = this.root + 'proposals/pdf/' + item[1];
                // We create an <a download href="..."> element, which forces 
                // the file to be downloaded and not opened in a new tab. 
                const el = document.createElement('a');
                el.href = url; el.download = "1"; el.click();
            }
        }
    }

}

export default CapsProposalsController;
