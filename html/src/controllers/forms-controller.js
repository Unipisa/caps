// const CapsAppController = require('./app-controller');
// const caps_forms_add = require('../modules/forms-add');

const React = require('react');
const ReactDOM = require('react-dom');
const CapsAppController = require('./app-controller');
const Form = require('../components/Form');

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
}

module.exports = CapsFormsController;
