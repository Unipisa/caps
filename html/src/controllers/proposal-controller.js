const CapsAppController = require('./app-controller');
const { loadDashboardData } = require('../modules/dashboard');
const caps_proposals_add = require('../modules/proposals-add');

class CapsProposalController extends CapsAppController {

    dashboard() {
        loadDashboardData();
    }

    add(params) {
        if (params.pass.length > 0) {
            // FIXME: We may use this to initialize the proposal for drafts, 
            // instead of the current hack passing data through CakePHP in an 
            // embedded script in the page. 
            const id = params.pass[0];
        }
        
        caps_proposals_add();
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

module.exports = CapsProposalController;
