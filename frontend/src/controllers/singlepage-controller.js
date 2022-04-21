import React from 'react';
import ReactDOM from 'react-dom';

import CapsAppController from './app-controller';
import SinglePage from '../components/SinglePage';

class SinglePageController extends CapsAppController {
    index(params) {
        console.log("singlepage-controller: index");
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <SinglePage id={id} root={this.root} csrfToken={params._csrfToken} />, 
            document.getElementById("app")
        );
    }

    view(params) {
        console.log("singlepage-controller: view");
    }

}

export default SinglePageController;
