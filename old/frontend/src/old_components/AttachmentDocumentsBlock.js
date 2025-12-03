'use strict';

import React from 'react';
import Attachment from './Attachment';
import Card from './Card';
import Share from './Share';

class AttachmentDocumentsBlock extends React.Component {

    constructor(props) {
        super(props);

        this.count = this.props.attachments.length + this.props.auths.length;
    }

    render() {
        if (this.count == 0) {
            return "";
        }

        var rows = [];

        for (var a of this.props.attachments) {
            rows.push(<Attachment controller={this.props.controller} root={this.props.root} key={"attachment-" + a.id} attachment={a}></Attachment>);
        }

        for (var a of this.props.auths) {
            rows.push(<Share key={"proposal-share-" + a.id} auth={a}></Share>);
        }

        // Sort the rows according to the "created" attribute
        rows.sort((a, b) => {
            const ad = a.props.attachment ? a.props.attachment.created : a.props.auth.created;
            const bd = b.props.attachment ? b.props.attachment.created : b.props.auth.created;
            return Date.parse(ad) - Date.parse(bd);
        });

        return <Card title={this.props.title}>
            <ul className="attachments">
                {rows}
            </ul>
        </Card>;
    }

}

export default AttachmentDocumentsBlock;