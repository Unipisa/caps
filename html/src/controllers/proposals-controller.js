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
        
        // caps_proposals_add();

        ReactDOM.render(
            <Proposal root={this.root} id={id} csrfToken={ params._csrfToken }></Proposal>,
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
    }

}

module.exports = CapsProposalsController;
