import React from 'react';
import ReactDOM from 'react-dom';
import CapsAppController from './app-controller';
import ThesisDefenses from '../components/ThesisDefenses';

class CapsThesisDefensesController extends CapsAppController {
    index(params) {
        ReactDOM.render(
            <ThesisDefenses
                root={this.root}
                csrfToken={params._csrfToken}
                timezone={params.timezone}></ThesisDefenses>,
            document.querySelector('#app')
        );
    }
}

export default CapsThesisDefensesController;
