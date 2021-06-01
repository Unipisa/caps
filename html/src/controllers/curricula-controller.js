const CapsAppController = require('./app-controller');

class CapsCurriculaController extends CapsAppController {

    index() {
        const self = this;

        document.getElementById('caps-duplicate-btn')
            .addEventListener('click', 
                (evt) => this.onDuplicateBtnClicked.apply(self, evt)
            );
    }

    onDuplicateBtnClicked(evt) {
        const year = document.getElementById('clone-year').value;
        
        Caps.submitForm('curricula-form', 
            { 'clone': 1, 'year': year }, 
            "Clonare i nuovi curricula per l'anno selezionato?"
        );
    }

}

module.exports = CapsCurriculaController;