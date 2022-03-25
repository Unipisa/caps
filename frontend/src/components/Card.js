'use strict';

import React from "react";

class Card extends React.Component {

    constructor(props) {
        super(props);

        this.containerClass = "card-header bg-" + 
            ((this.props.bg !== undefined) ? this.props.bg : "primary");
        this.titleClass = this.props.titleClass ? this.props.titleClass : "text-white"
    }

    renderTitle() {
        return <div className={this.containerClass}>
                <h3 className={"h5 " + this.titleClass}>{this.props.title}</h3>
        </div>;
    }

    render() {
        return <div className="row my-2">
            <div className="col">
                <div className="card shadow">
                    { this.props.title  && this.renderTitle() }
                    <div className="card-body">
                        {this.props.children}
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default Card;