import React from 'react';
import ReactDOM from 'react-dom';
import CapsAppController from './app-controller';
import Form from '../components/Form';
import Forms from '../components/Forms';

class CapsFormsController extends CapsAppController {
    edit(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <Form 
                root={this.root} 
                id={id} 
                csrfToken={params._csrfToken} 
                edit={true}
                form_template_id={params["?"]["form_template_id"] || null}></Form>,
            document.querySelector('#app')
        );
    }

    view(params) {
        const id = (params.pass.length > 0) ? params.pass[0] : undefined;

        ReactDOM.render(
            <Form 
                root={this.root} 
                id={id} 
                csrfToken={params._csrfToken} 
                edit={false}></Form>,
            document.querySelector('#app')
        );
    }

    index(params) {
        var query = params["?"];
        if (query === undefined) {
            query = {};
        }

        query = {limit: 15,... query};

        sessionStorage.setItem('forms-filter', JSON.stringify(query));

        ReactDOM.render(
            <Forms
                root={this.root}
                query={query}
                csrfToken={params._csrfToken}></Forms>,
            document.querySelector('#app')
        );
    }
}

export default CapsFormsController;
