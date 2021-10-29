'use strict';

const React = require('react');
const Card = require('./Card');
const LoadingMessage = require('./LoadingMessage');
const FormTemplates = require('../models/form_templates');
const Forms = require('../models/forms');
const Users = require('../models/users');

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
            html = this.compile_html(form_template.text, form.data, form.state, form.user);
        }
        if (form === null && form_templates === null) {
            form_templates = await FormTemplates.allActive();
        }
        this.setState({form, form_template, form_templates, html});
    }

    onFormTemplateSelected(evt) {
        const idx = evt.target.value;
        if (idx >= 0) {
            const form_template = this.state.form_templates[idx]
            this.setState({
                'form_template': form_template,
                'html': this.compile_html(form_template.text, {}, 'draft', Caps.params.user)
            });
        }
    }

    compile_html(s, data, form_state, user) {
        const user_data = {
            'firstname': user['givenname'],
            'lastname': user['surname'],
            'code': user['number'],
            'email': user['email'],
            'username': user['username']
        }

        s = s.replace(/{\s*user\.([A-Za-z_]*)\s*}/g, (match, s) => user_data[s]);
        
        s = `<form id="form-form">
             <div id="form-div" class="form-form">${s}</div>
             <div class="form-group btn-group mt-4">`;

        if (form_state == 'draft') {
            s += `<button class="btn btn-success" type="submit" name="submit">Invia</button>`;
        }             
        if (this.props.edit) {
            // possibile salvare bozza solo in EDIT
            s += `<button class="btn btn-primary" type="submit" name="save">Salva bozza</button>`;
        }
        s += `</div></form>`;

        return s;
    }

    componentDidUpdate() {
        this.fields = {};
        const form = document.getElementById("form-form");
        if (!form) return; // the form has not been rendered yet
        form.addEventListener('submit', this.onSave.bind(this));
        if (!this.state.form) return; // this is a new form, no data needs to be injected
        const form_div = document.getElementById("form-div");
        const array_to_list = arr => {
            var lst = [];
            for (let i=0; i<arr.length; ++i) lst.push(arr[i]);
            return lst;
        } 
        const data = this.state.form.data;
        const inputs = array_to_list(form_div.getElementsByTagName('input'))
        inputs.forEach(el => {
            if (el.type === "radio") {
                const checked = (data[el.name] === el.value);
                if (this.props.edit) {
                    el.checked = checked;
                } else {
                    let new_el = document.createElement('span');
                    new_el.className = checked?"form-freezed-checked-radio":"form-freezed-unchecked-radio";
                    new_el.innerHTML = checked?'<b>X</b>':'o';
                    el.parentNode.replaceChild(new_el, el);
                }
            } else {
                el.value = data[el.name];
                if (!this.props.edit) {
                    let new_el = document.createElement('b');
                    new_el.className = "form-freezed-input";
                    new_el.innerText = data[el.name];
                    el.parentNode.replaceChild(new_el, el);
                }
            }
        });

        const texts = array_to_list(form_div.getElementsByTagName('textarea'));
        texts.forEach(el => {
            if (this.props.edit) {
                el.value = data[el.name];
            } else {
                el.setAttribute("readonly", "readonly");
            }
        });

        const selects = array_to_list(form_div.getElementsByTagName('select'));
        selects.forEach(el => {
            el.value = data[el.name];
            if (!this.props.edit) {
                let new_el = document.createElement('b');
                new_el.className = "form-freezed-select";
                let option = el.options[el.selectedIndex];
                if (option) {
                    new_el.innerText = option.text;
                }
                el.parentNode.replaceChild(new_el, el);
        }
        });
    }

    onSave(evt) {
        evt.preventDefault();
        let payload = new URLSearchParams();
        if (this.props.edit) {
            const formData = new FormData(evt.target);
            const data = [...formData.entries()]
            .reduce((all, entry) => {
                all[entry[0]] = entry[1]
                return all
            }, {});
            payload.append("form_template_id", this.state.form_template.id);
            payload.append("data", JSON.stringify(data));
        }
        payload.append("action", evt.submitter.name);
        payload.append('_csrfToken', this.props.csrfToken);

        if (this.props.edit) {
            submitForm(window.location.href, 'post', payload);
        } else {
            // USE the "edit" url instead of "view"
            submitForm(`../edit/${this.state.form.id}`, 'post', payload);
        }
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
//            <h1 key="form-h1">{ this.state.form_template.name }</h1>,
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