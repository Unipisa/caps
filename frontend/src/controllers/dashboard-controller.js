import React from 'react';
import ReactDOM from 'react-dom';
import CapsAppController from './app-controller';
import { extendedRestClient as restClient} from '../modules/api';
import Dashboard from '../components/Dashboard';


class DashboardController extends CapsAppController {
    async index(params) {
        // We fetch the data to display in the plots
        let data = await restClient.get('dashboard');

        // FIX: cakephp inability to distinguish between {} and []
        if (typeof(data.proposal_comments) === 'object' ) {
            data.proposal_comments = [];
        }
        ReactDOM.render(
            <Dashboard
                root={this.root}
                data={data}
                csrfToken={params._csrfToken}></Dashboard>,
            document.querySelector('#app')
        );
    }

}

export default DashboardController;
