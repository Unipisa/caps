import React from 'react';
import ReactDOM from 'react-dom';
import UserProfile from '../components/UserProfile';
import CapsAppController from './app-controller';

class CapsUsersController extends CapsAppController {

    view(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <UserProfile id={id} root={this.root} csrfToken={params._csrfToken} />, 
            document.getElementById("app")
        );
    }

}

export default CapsUsersController;