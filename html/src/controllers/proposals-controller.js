const CapsAppController = require('./app-controller');
const { loadDashboardData } = require('../modules/dashboard');
const caps_proposals_add = require('../modules/proposals-add');

const React = require('react');
const ReactDOM = require('react-dom');
const Proposal = require('../components/Proposal');

class CapsProposalsController extends CapsAppController {

    dashboard() {
        loadDashboardData();
    }

    add(params) {
        var id = undefined;
        if (params.pass.length > 0) {
            // FIXME: We may use this to initialize the proposal for drafts, 
            // instead of the current hack passing data through CakePHP in an 
            // embedded script in the page. 
            id = params.pass[0];
        }

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

        sessionStorage.setItem('proposals-filter', JSON.stringify(query));

        // At this point we need to rewrite the links that may point to 
        // outdated information. 
        this.updateProposalsURL();

        // Add a callback to the download proposals button
        document.getElementById("proposals-massive-download-button").onclick = this.onDownloadProposalsClicked.bind(this);
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

module.exports = CapsProposalsController;
