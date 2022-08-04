import React from 'react';
import ReactDOM from 'react-dom';
import CapsAppController from './app-controller';
import Logs from '../components/Logs';

class LogsFormsController extends CapsAppController {
    index(params) {
        ReactDOM.render(
            <Logs
                root={this.root}
                csrfToken={params._csrfToken}></Logs>,
            document.querySelector('#app')
        );
    }
}

export default LogsFormsController;
