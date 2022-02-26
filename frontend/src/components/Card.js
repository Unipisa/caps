'use strict';

import React from "react";
import SmallCard from "./SmallCard";

class Card extends React.Component {

    render() {
        return <div className="row my-2">
            <div className="col">
                <SmallCard {...this.props}>
                    {this.props.children}
                </SmallCard>
            </div>
        </div>;
    }
}

export default Card;