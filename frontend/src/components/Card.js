'use strict';

import React from "react";
import SmallCard from "./SmallCard";

class Card extends React.Component {

    onClick() {
        if (this.props.onClick !== undefined) {
            this.props.onClick(this);
        }
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