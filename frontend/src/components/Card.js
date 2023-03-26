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
*   - onClick()
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

    return <BootStrapCard className={cardClass} onClick={onClick}>
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
