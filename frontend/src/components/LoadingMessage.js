'use strict';

import React from 'react';

class LoadingMessage extends React.Component {
    render() {
        return <div style={{ display: "flex", alignItems: "center" }}>
            <div className="spinner-border spinner-border-sm text-primary mr-2" role="status"></div>
            <div>{this.props.children}</div>
        </div>;
    }
}

export default LoadingMessage;