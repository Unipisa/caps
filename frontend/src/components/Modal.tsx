import React from "react"

function Modal({ title, content, callback }) {
    const show = !!content
    title ||= "conferma"
    callback ||= () => {}
    return <>
        <div style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                width: "100%", 
                height: "100%", 
                zIndex: "1049", 
                display: show ? "block" : "none" ,
                transition: "background-color 1s ease",
                backgroundColor: show ? "rgb(255,255,255,0.8)" : "rgba(255,255,255,0.0)"
            }}>
            &nbsp;
        </div>
        <div className={"modal" + (show ? " d-block" : "") } role="dialog">
            <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{ title }</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => callback(null)}>
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div className="modal-body">
                <p>{ content}</p>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" 
                    onClick={() => callback(false)}>Annulla</button>
                <button type="button" className="btn btn-primary" 
                    onClick={() => callback(true)}>Ok</button>
                </div>
            </div>
            </div>
        </div>
    </>;
}

export default Modal;
