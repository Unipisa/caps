import React from "react";

class Modal extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            'title': 'CAPS', 
            'content': 'Ciao',
            display_class: 'd-none', 
            callback: null
        }

        this.overlay_ref = React.createRef();
    }

    show(title, content, callback = null) {
        this.overlay_ref.current.style.display = "block";
        this.overlay_ref.current.style.backgroundColor = "rgb(255,255,255,0.8)";

        this.setState({
            title: title, 
            content: content, 
            display_class: 'd-block', 
            callback: callback
        }); 
    }

    hide() {
        this.overlay_ref.current.style.display = "none";
        this.overlay_ref.current.style.backgroundColor = "rgb(255,255,255,0)";

        this.setState({
            display_class: 'd-none'
        })
    }

    onOkClicked() {
        this.hide();

        if (this.state.callback !== null) {
            this.state.callback(true);
        }
    }

    onCancelClicked() {
        this.hide();

        if (this.state.callback !== null) {
            this.state.callback(false);
        }
    }

    render() {
        return <>
        <div ref={this.overlay_ref} style={{ 
                position: "fixed", 
                top: 0, 
                left: 0, 
                width: "100%", 
                height: "100%", 
                zIndex: "1049", 
                display: "none",
                transition: "background-color 1s ease",
                backgroundColor: "rgba(255,255,255,0.0)"
            }}>
            &nbsp;
        </div>
        <div className={"modal " + this.state.display_class} tabIndex="-1" role="dialog">
            <div className="modal-dialog" role="document">
            <div className="modal-content">
                <div className="modal-header">
                <h5 className="modal-title">{this.state.title}</h5>
                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
                </div>
                <div className="modal-body">
                <p>{this.state.content}</p>
                </div>
                <div className="modal-footer">
                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.onCancelClicked.bind(this)}>Annulla</button>
                <button type="button" className="btn btn-primary" onClick={this.onOkClicked.bind(this)}>Ok</button>
                </div>
            </div>
            </div>
        </div>
        </>;
    }
}

export default Modal;