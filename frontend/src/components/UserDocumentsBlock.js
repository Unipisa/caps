import React from "react";
import Attachment from "./Attachment";
import Card from "./Card";
import NewAttachmentForm from "./NewAttachmentForm";

function UserDocumentsBlock(props) {
    const documents = props.documents ? props.documents : [];

    var document_rows = documents.map((d) => {
        return <Attachment 
            root={props.root} 
            controller="documents" 
            attachment={d} key={"document-" + d.id}
            onDeleteClicked={props.onDeleteClicked}
            showDeleteButton="true"
        ></Attachment>
    });

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

    if (documents.length > 0) {
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

    return <div className="mt-2">
        <h2>Documenti e allegati</h2>
        <Card>
            {output}
            <NewAttachmentForm onNewAttachment={newAttachmentCallback}></NewAttachmentForm>
        </Card>
    </div>;
}

export default UserDocumentsBlock;