'use strict';

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const FormTemplates = require('../models/form_templates');
const Forms = require('../models/forms');

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'form': null,
            'form_template': null,
            'form_templates': null
        };

        this.load();
    }

    async load() {
        let form = this.state.form;
        let form_template = this.state.form_template;
        let form_templates = this.state.form_templates;
        if (form === null && this.props.id !== undefined) {
            form = await Forms.get(this.props.id);
            form_template = await FormTemplate.get(form.form_template_id);
        }
        if (form === null && form_templates === null) {
            form_templates = await FormTemplates.all();
        }
        this.setState({form, form_template, form_templates});
    }

    onFormTemplateSelected(evt) {
        const idx = evt.target.value;
        if (idx >= 0) {
            this.setState({
                'form_template': this.state.form_templates[idx],
            });
        }

    }

    renderTemplateSelection() {
        if (this.state.form_templates === null) {
            return <LoadingMessage key="loading-degrees">
                Caricamento modelli...
            </LoadingMessage>
        } 
        const options = this.state.form_templates.map((form_template, idx) => {
            return <option key={"form-template-" + form_template.id} value={idx}>
                {form_template.name} 
            </option>;
        });

        return <div className="form-group" key="form-template-selection">
            <select className="form-control" onChange={this.onFormTemplateSelected.bind(this)}
                value={this.state.form_template ? this.state.form_templates.map((d) => d.id).indexOf(this.state.form_template.id) : -1}>
                <option key="form-template-dummy" value="-1">
                    Selezionare il modello
                </option>
                {options}
            </select>
        </div>;
    }

    renderForm() {
        return [
        <h1>{ this.state.form_template.name }</h1>,
        <div dangerouslySetInnerHTML={{ __html: this.state.form_template.text }} >
        </div>];
    }

    render() {
        if (this.state.form_template === null) {
            return this.renderTemplateSelection();
        } else {
            return this.renderForm();
        }
    }

}

module.exports = Form;