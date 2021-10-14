'use strict';

const React = require('react');
const Card = require('./Card');

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'form': null,
            'form_templates': null
        };
    }

    render() {
        return <div>
            ciao!
        </div>;
    }

}

module.exports = Form;