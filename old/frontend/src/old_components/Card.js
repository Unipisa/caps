'use strict';

import React from "react";
import SmallCard from "./SmallCard";

class Card extends React.Component {

    onClick() {
        if (this.props.onClick !== undefined) {
            this.props.onClick(this);
        }
    }

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
        return <div className="row" onClick={this.onClick.bind(this)}>
            <div className="col">
                <SmallCard {...this.props}>
                    {this.props.children}
                </SmallCard>
            </div>
        </div>;
    }
}

export default Card;
