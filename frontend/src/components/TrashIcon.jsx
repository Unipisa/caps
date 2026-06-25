'use strict';

import React from "react";

class TrashIcon extends React.Component {

    onClick(event) {
        if (this.props.onClick) {
            this.props.onClick(event);
        }
    }

    render() {
        return <div className="col-1 my-auto" 
                onClick={this.onClick.bind(this)} style={{ cursor: "pointer" }}
                onMouseLeave={(e) => e.target.children[0].classList.remove("text-danger")}
                onMouseEnter={(e) => e.target.children[0].classList.add("text-danger")}>
            <i className='delete fas fw fa-trash'></i>
        </div>;
    }

}

export default TrashIcon;
