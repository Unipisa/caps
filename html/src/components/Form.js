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

        this.edit = this.props.edit || false;

        this.load();
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
            this.fields[name]="input";
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

        let radio_replacer = (name, value) => {
            this.fields["name"] = "radio";
            return `<input type="radio" name="${name}" value="${value}">`;
        }

        s = s.replace(/{\s*([A-Za-z_]*)=([A-Za-z_]*)\s*}/g, (match, name, value) => radio_replacer(name, value));
        s = s.replace(/{\s*([A-Za-z_]*):([A-Za-z_]*)\s*}/g, (match, name, kind) => input_replacer(name, kind));
        s = s.replace(/{\s*([A-Za-z_]*)\s*}/g, (match, s, kind) => input_replacer(s));
        s = `<form id="form-form">
             <div id="form-div" class="form-form">${s}</div>
             <input type="submit" name="save" value="salva bozza">
             <input type="submit" name="submit" value="invia">
             </form>`
        return s; //
    }

    componentDidUpdate() {
        this.fields = {};
        const form = document.getElementById("form-form");
        if (!form) return; // the form has not been rendered yet
        form.addEventListener('submit', this.onSave.bind(this));
        if (!this.state.form) return; // this is a new form, no data needs to be injected
        const form_div = document.getElementById("form-div");
        const inputs = form_div.getElementsByTagName('input');
        for(let i=0; i<inputs.length; ++i) {
            let el = inputs[i];
            if (el.type === "radio") {
                if (this.state.form.data[el.name] === el.value) {
                    el.checked = true;
                } else {
                    el.checked = false;
                }
            } else {
                el.value = this.state.form.data[el.name];
            }
        }
        const texts = form_div.getElementsByTagName('textarea');
        for(let i=0; i<texts.length; ++i) {
            let el = texts[i];
            el.value = this.state.form.data[el.name];
        }
    }

    onSave(evt) {
        evt.preventDefault();
        const formData = new FormData(evt.target);
        const data = [...formData.entries()]
          .reduce((all, entry) => {
            all[entry[0]] = entry[1]
            return all
          }, {});
        let payload = new URLSearchParams();
        payload.append("form_template_id", this.state.form_template.id);
        payload.append("data", JSON.stringify(data));
        payload.append("action", evt.submitter.name);
        payload.append('_csrfToken', this.props.csrfToken);

        submitForm(window.location.href, 'post', payload);
        return false;
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
            <h1 key="form-h1">{ this.state.form_template.name }</h1>,
            <div key="form-div" dangerouslySetInnerHTML={{ __html: this.state.html }} ></div>
        ];
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