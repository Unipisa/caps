'use strict';

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const FormTemplates = require('../models/form_templates');
const Forms = require('../models/forms');

const submitForm = require('../modules/form-submission');

class Form extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            'form': null,
            'form_template': null,
            'form_templates': null,
            'html': ""
        };

        this.fields = [];
        this.edit = this.props.edit || false;

        this.load();
    }

    compile_html(s, data) {
        const user = Caps.params.user;
        const user_data = {
            'firstname': user['givenname'],
            'lastname': user['surname'],
            'code': user['number'],
            'email': user['email'],
            'username': user['username']
        }
        s = s.replace(/{\s*user\.([A-Za-z_]*)\s*}/g, (match, s) => user_data[s]);
        
        let input_replacer = (name, kind) => {
            kind = kind || "string";
            const value = data[name] || "";
            this.fields.push(name);
            if (kind === "text") {
                return (this.edit 
                    ? `<textarea id='form_input_${name}'>${value}</textarea>`
                    : `<p>${value}</p>`);
            } else if (kind === "string") {
                return (this.edit 
                    ? `<input id="form_input_${name}" value="${encodeURIComponent(value)}">`
                    : `<span>${value}</span>`);
            } else {
                return "[invalid type]";
            }
        }

        s = s.replace(/{\s*([A-Za-z_]*):([A-Za-z_]*)\s*}/g, (match, s, kind) => input_replacer(s, kind));
        s = s.replace(/{\s*([A-Za-z_]*)\s*}/g, (match, s, kind) => input_replacer(s));
        return s;
    }

    async load() {
        let form = this.state.form;
        let form_template = this.state.form_template;
        let form_templates = this.state.form_templates;
        let html = "";
        if (form === null && this.props.id !== undefined) {
            form = await Forms.get(this.props.id);
            form_template = form.form_template;
            html = this.compile_html(form_template.text, form.data);
        }
        if (form === null && form_templates === null) {
            form_templates = await FormTemplates.all();
        }
        this.setState({form, form_template, form_templates, html});
    }

    onFormTemplateSelected(evt) {
        const idx = evt.target.value;
        if (idx >= 0) {
            const form_template = this.state.form_templates[idx]
            this.setState({
                'form_template': form_template,
                'html': this.compile_html(form_template.text, {})
            });
        }
    }

    onSave(evt) {
        if (this.state.form_template === null) return;
        let payload = new URLSearchParams();
        let data = this.state.form ? this.state.form.data : {};
        this.fields.forEach(name => {
            data[name] = document.getElementById('form_input_' + name).value;
        });
        payload.append("form_template_id", this.state.form_template.id);
        payload.append("data", JSON.stringify(data));
        payload.append("action", evt.target.name);
        payload.append('_csrfToken', this.props.csrfToken);

        submitForm(window.location.href, 'post', payload);
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
        let blocks = [];
        blocks.push(<h1 key="form-h1">{ this.state.form_template.name }</h1>);
        blocks.push(<div key="form-div" dangerouslySetInnerHTML={{ __html: this.state.html }} ></div>);
        if (this.edit) {
            blocks.push(<button key="form-save-button" type="submit" name="save" onClick={this.onSave.bind(this)}>salva bozza</button>);
            blocks.push(<button key="form-submit-button" type="submit" name="submit" onClick={this.onSave.bind(this)}>invia modulo</button>);
        }
        return blocks;
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