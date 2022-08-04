import React from "react";
import Attachment from "./Attachment";
import Card from "./Card";
import LoadingMessage from "./LoadingMessage";
import NewAttachmentForm from "./NewAttachmentForm";

function DocumentsBlock(props) {
    const documents = props.documents ? props.documents : [];

    var document_rows = documents.map((d) => {
        return <Attachment 
            root={props.root} 
            controller={props.controller}
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
    const output = [];
    if (props.info_text) output.push(<p key="info_text">{ props.info_text }</p>);

    if (document_rows.length > 0) {
        output.push(<div key="document_rows">{ document_rows }</div>)
    } else {
        output.push(<p key="no_document">Nessun documento allegato.</p>)
    }

    const newAttachmentCallback = (a) => {
        if (props.onNewAttachment) {
            props.onNewAttachment(a);
        }
    }

    return <div className={props.className}>
        <Card>
            {output}
            <NewAttachmentForm onNewAttachment={newAttachmentCallback}></NewAttachmentForm>
        </Card>
    </div>;
}

export default DocumentsBlock;