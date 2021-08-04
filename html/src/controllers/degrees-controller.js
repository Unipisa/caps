const CapsAppController = require('./app-controller');

class CapsDegreesController extends CapsAppController {

    index() {
        document
            .getElementById('caps-duplicate-btn')
            .addEventListener('click', this.onDuplicateBtnClicked);
    }

    onDuplicateBtnClicked(evt) {
        const year = document.getElementById('clone-year').value;
        
        Caps.submitForm('form-degree', 
            { 'clone': 1, 'year': year }, 
            "Clonare i nuovi corsi per l'anno selezionato?"
        );
    }
}

module.exports = CapsDegreesController;