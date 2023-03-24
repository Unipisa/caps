'use strict'

import React from "react";

import { default as BootStrapCard } from 'react-bootstrap/Card';

function classWithDefault(className, defaultClass) {
    let output = defaultClass;
    if (className !== undefined) {
        output += ' ' + className;
    }
    return output;

}

/**
* Custom Card component based on (react-)boostrap's Card with default styles
* to adhere to the website style.
*
* Possible props:
*   - className, additional classes added to the card component
*   - title, optional title to add to the card header
*   - onClick(card), function to call on the onClick event of the card
*           Note: the function can take the card component itself as first
*           argument
*   - children[]
*/
export default function Card({
    className,
    title,
    // titleClass,
    // titleBg,
    onClick,
    children
}) {
    let cardClass = classWithDefault(className, 'shadow my-2');
    // let headerClass = titleBg || 'bg-primary';
    // let titleClass = classWithDefault(titleClass, 'text-white');
    let headerClass = 'bg-primary'
    let titleClass = 'text-white';

    function onClick() {
        if (this.onClick !== undefined) {
            this.onClick(this);
        }
    }

    return <BootStrapCard className={cardClass} onClick={onClick.bind(this)}>
        {title &&
            <BootStrapCard.Header className={headerClass}>
                <h5 className={titleClass}>
                    {title}
                </h5>
            </BootStrapCard.Header>
        }
        <BootStrapCard.Body>
            {children}
        </BootStrapCard.Body>
    </BootStrapCard>;
}
