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
            <Form root={this.root} id={id} csrfToken={params._csrfToken}></Form>,
            document.querySelector('#app')
        );
    }
}

module.exports = CapsFormsController;
