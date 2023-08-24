'use strict';

import React, { useState } from 'react';
import LoadingMessage from './LoadingMessage';
import Card from './Card';
import restClient from '../modules/api';

import submitForm from '../modules/form-submission';

import "react-datepicker/dist/react-datepicker.css";

import ReactDOM from 'react-dom';
import DatePicker from 'react-datepicker';

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
            form = await restClient.get(`forms/${this.props.id}`);
            form_template = form.form_template;
            html = this.compile_html(form_template.text, form.data, form.state, form.user);
        }
        if (form_template === null && this.props.form_template_id) {
            form_template = await restClient.get(`form_template/${this.props.form_template_id}`);
            html = this.compile_html(form_template.text, {}, 'draft', Caps.params.user);
        }
        if (form_template === null && form_templates === null) {
            form_templates = await restClient.get('form_templates', { 'enabled': true });            
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


    enhanceDatePickers(form) {
        Array.from(form.getElementsByClassName("datepicker")).forEach((el) => {
            // Create an appropriate state for this component
            const name = el.name ? el.name : el.getAttribute('data-name')
            const elementId = `datepicker-react-${name}`;
            const stateName = `dates.${elementId}`;

            // If this field was already set we load it from the form data
            if (! this.state[stateName]) {
                this.state[stateName] = new Date();
                if (this.state.form && this.state.form.data[name] !== undefined) {
                    this.state[stateName] = new Date(this.state.form.data[name]);
                }
            }
                
            // We use a new container to hold this react component; the name 
            // is set to data-name for later recovery
            var container = document.createElement('div');
            container.classList += elementId + ' datepicker d-inline-block';
            container.setAttribute('data-name', name);

            let changeHandler = (date) => {
                console.log(date);
                this.setState({ [stateName]: date });
            };

            let reactElem = <DatePicker 
                selected={this.state[stateName]} 
                name={name} 
                dateFormat="yyyy-MM-dd"
                onChange={changeHandler}>
            </DatePicker>;

            el.parentNode.replaceChild(container, el);
            ReactDOM.render(reactElem, container);
        });
    }

    componentDidUpdate() {
        this.fields = {};
        const form = document.getElementById("form-form");
        if (!form) return; // the form has not been rendered yet

        if (this.props.edit)
            this.enhanceDatePickers(form);

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
            }
            else {
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
            el.value = data[el.name];
            if (! this.props.edit) {
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

    onSave(action, evt) {
        evt.preventDefault();
        let payload = new URLSearchParams();
        if (this.props.edit) {
            const formData = new FormData(document.getElementById('form-form'));
            const data = [...formData.entries()]
            .reduce((all, entry) => {
                all[entry[0]] = entry[1]
                return all
            }, {});
            payload.append("form_template_id", this.state.form_template.id);
            payload.append("data", JSON.stringify(data));
        }
        payload.append("action", action);
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
        return <form id="form-form">
            <div id="form-div" className="form-form" >
                <div key="form-div" dangerouslySetInnerHTML={{ __html: this.state.html }} ></div>
            </div>
            { this.props.edit && 
            <div className="form-group btn-group mt-4">
                <button onClick={(evt) => this.onSave('submit', evt)} className="btn btn-success">Invia</button>
                <button onClick={(evt) => this.onSave('save', evt)} className="btn btn-primary">Salva bozza</button> 
            </div>
            }
        </form>;
    }

    /**
     * Show badges for this form, such as "submitted on ...", or "approved on ...", and so on.
     */
    render() {
        if (this.state.form_template === null) {
            return <Card>
                {this.renderTemplateSelection()}
            </Card>;
        } else {
            return <Card title={this.state.form_template.name}>
                {this.renderBadges()}
                {this.renderDraftNotice()}
                {this.renderForm()}
            </Card>;
        }
    }

}

export default Form;