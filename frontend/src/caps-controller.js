// This class implements all the handler needed by the elements in CAPS.
import jQuery from 'jquery';
import CapsAppController from './controllers/app-controller';

import CapsCurriculaController from './controllers/curricula-controller';
import CapsDegreesController from './controllers/degrees-controller';
import CapsExamsController from './controllers/exams-controller';
import CapsProposalsController from './controllers/proposals-controller';
import CapsSettingsController from './controllers/settings-controller';
import CapsFormsController from './controllers/forms-controller';
import CapsFormTemplatesController from './controllers/form-templates-controller';
import CapsUsersController from './controllers/users-controller';
import CapsDashboardController from './controllers/dashboard-controller';

'use strict'

/* 
 * We maintain a dictionary of the classes that should be instantiated for 
 * particular controllers; these classes are passed as argument the action 
 * that is being rendered. 
 */
const routes = {
    "Curricula": CapsCurriculaController,
    "Proposals": CapsProposalsController,
    "Settings": CapsSettingsController,
    "Exams": CapsExamsController,
    "Degrees": CapsDegreesController,
    "Forms": CapsFormsController,
    "FormTemplates": CapsFormTemplatesController,
    "Users": CapsUsersController,
    "Dashboard": CapsDashboardController
}

/**
 * The CapsController classes has two roles:
 * 
 *  - It is available as a globally defined CapsController object, so we use it 
 *    as a bridge with CakePHP, to store some data and pass request variables, 
 *    see for instance the saveProposalsFilter below; 
 * 
 *  - It instantiates JS classes based on the current controller, and if those 
 *    have a method whose name matches the current action this is automatically 
 *    called as well. The query parameters are passed as an array. 
 */
class CapsController {

    constructor(root, controller, action, params = []) {
        this.root = root;
        this.controller = controller;
        this.action = action;
        this.params = params;

        jQuery(() => {
            if (routes.hasOwnProperty(this.controller)) {
                const controller = new routes[this.controller](root);

                if (controller[action] !== undefined) {
                    controller[action](params);
                }
            }
            else {
                // In case the controller for this particular page has not been 
                // overloaded we call the default one. 
                const controller = new CapsAppController(root);
            }
        });
    }

    // Trigger a CSV download using Javascript. 
    downloadCSV() {
        location.pathname += '.csv';
    }

    downloadXLSX() {
        location.pathname += '.xlsx';
    }
    

    // Submit a form by injecting the name and value of an element; this is used
    // in several places where we allow to operate on a set of elements selected
    // by checkboxes, even with buttons that are outside the HTML <form> tags.
    submitForm(form_id, data, action_message) {
        if (action_message == null || confirm(action_message)) {
            var form = document.getElementById(form_id);

            for (var key in data) {
                // Insert hidden input entries in the form
                var inp = document.createElement('input');
                inp.name = key;
                inp.value = data[key];
                inp.style = "display: none";
                form.appendChild(inp);
            }

            form.submit();
        }
    }

}

export default CapsController;
