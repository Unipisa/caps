import React from "react";
import Attachment from "./Attachment";
import Card from "./Card";
import LoadingMessage from "./LoadingMessage";
import NewAttachmentForm from "./NewAttachmentForm";

function UserDocumentsBlock(props) {
    const documents = props.documents ? props.documents : [];

    var document_rows = documents.map((d) => {
        return <Attachment 
            root={props.root} 
            controller="documents" 
            attachment={d} 
            key={"document-" + d.id}
            onDeleteClicked={props.onDeleteClicked}
            showDeleteButton="true"
        ></Attachment>
    });

    if (props.loadingDocument) {
        document_rows.push(
            <div key="document-loading" className="card border-left-primary mb-2">
                <div className="card-body p-1">
                    <LoadingMessage>
                        Caricamento del documento in corso...
                    </LoadingMessage>
                </div>
            </div>
        )
    }

    const info_text = <p>
        I documenti e le annotazioni inserite in questa sezione
        sono associate allo studente, ma sono visibili solo 
        per gli amministratori.
    </p>

    // Default output when no documents are in the database, this will be overriden
    // if documents.length > 0
    var output = <>
            {info_text}
            <p>Nessun documento allegato.</p>
        </>;

    if (document_rows.length > 0) {
        output = <>
            {info_text}
            {document_rows}
        </>;
    }

    const newAttachmentCallback = (a) => {
        if (props.onNewAttachment) {
            props.onNewAttachment(a);
        }
    }

    return <div className={props.className}>
        <h2>Documenti e allegati</h2>
        <Card>
            {output}
            <NewAttachmentForm onNewAttachment={newAttachmentCallback}></NewAttachmentForm>
        </Card>
    </div>;
}

export default UserDocumentsBlock;