'use strict';

import React from "react";

/**
 * Properties:
 * 
 *  title: The title rendered in the top block
 *  truncate_title: If set to anything, then the title is automatically 
 *      truncate to fit the available space. 
 *  className: CSS classes to be added to the external card div. 
 */
class SmallCard extends React.Component {

    renderTitle() {
        let title_classes = "h5 text-white";

        if (this.props.truncate_title !== undefined) {
            title_classes += " text-truncate";
        }

        return <div className="card-header bg-primary">
                <p className={title_classes}>{this.props.title}</p>
        </div>;
    }

    render() {
        let wrapClasses = "card shadow ";
        if (this.props.className) {
            wrapClasses += this.props.className;
        }

        return  <div className={wrapClasses} onClick={this.props.onClick}>
            { this.props.title  && this.renderTitle() }
            <div className="card-body">
                {this.props.children}
            </div>
        </div>;
    }
}

export default SmallCard;