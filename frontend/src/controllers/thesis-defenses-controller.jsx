import React from 'react';
import ReactDOM from 'react-dom';
import CapsAppController from './app-controller';
import ThesisDefenses from '../components/ThesisDefenses';
import ThesisDefenseAdd from '../components/ThesisDefenseAdd';
import ThesisDefenseView from '../components/ThesisDefenseView';
import ThesisDefenseManage from '../components/ThesisDefenseManage';

class CapsThesisDefensesController extends CapsAppController {
    index(params) {
        ReactDOM.render(
            <ThesisDefenses
                root={this.root}
                apiRoot={this.root + 'api/v1/'}
                csrfToken={params._csrfToken}
                timezone={params.timezone}
                caps={params.caps}></ThesisDefenses>,
            document.querySelector('#app')
        );
    }

    add(params) {
        ReactDOM.render(
            <ThesisDefenseAdd
                root={this.root}
                apiRoot={this.root + 'api/v1/'}
                csrfToken={params._csrfToken}
                caps={params.caps}
                user={params.user}></ThesisDefenseAdd>,
            document.querySelector('#app')
        );
    }

    view(params) {
        const defenseId = (params.pass && params.pass.length > 0) ? params.pass[0] : undefined;
        ReactDOM.render(
            <ThesisDefenseView
                root={this.root}
                apiRoot={this.root + 'api/v1/'}
                csrfToken={params._csrfToken}
                caps={params.caps}
                user={params.user}
                defenseId={defenseId}
                isAdmin={params.user?.admin || false}></ThesisDefenseView>,
            document.querySelector('#app')
        );
    }

    manage(params) {
        const defenseId = (params.pass && params.pass.length > 0) ? params.pass[0] : undefined;
        ReactDOM.render(
            <ThesisDefenseManage
                root={this.root}
                apiRoot={this.root + 'api/v1/'}
                csrfToken={params._csrfToken}
                caps={params.caps}
                user={params.user}
                defenseId={defenseId}></ThesisDefenseManage>,
            document.querySelector('#app')
        );
    }
}

export default CapsThesisDefensesController;
