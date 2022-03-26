import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import LoadingMessage from './LoadingMessage';
import FormInfo from './FormInfo';
import Card from './Card';

class FormsBlock extends React.Component {
    render() {
        const forms = this.props.forms;
        return <div className="mt-4">
            <h2 className="d-flex">
                <span className="mr-auto">Moduli</span>
                <a href={this.props.root + 'forms/edit'} className="my-auto btn btn-sm btn-primary shadow-sm">
                    <FontAwesomeIcon icon={faEdit}></FontAwesomeIcon>
                    <span className="d-none d-md-inline ml-2">Nuovo modulo</span>
                </a>
            </h2>
            { forms === undefined && <LoadingMessage>Caricamento dei moduli in corso</LoadingMessage>}
            {
                forms !== undefined && <div>
                    { forms.length == 0 && <p>Nessun modulo compilato.</p>}
                    <div className="row">{ forms.map(f => <FormInfo root={this.props.root} 
                        csrfToken={this.props.csrfToken} 
                        key={"form-info-" + f.id} 
                        onDeleteClicked={this.props.onDeleteClicked.bind(this)}
                        form={f}></FormInfo>)
                    }</div>
                </div> 
            }
            
        </div>
    }
}

export default FormsBlock;