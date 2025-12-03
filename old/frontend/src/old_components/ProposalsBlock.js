import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import ProposalInfo from "./ProposalInfo";
import LoadingMessage from "./LoadingMessage";
import Card from "./Card";

function ProposalsBlock(props) {
    return <div className={props.className}>
        <h2 className="d-flex">
            <span className="mr-auto">Piani di studio</span>
            <a href={props.root + 'proposals/edit'} className="my-auto btn btn-sm btn-primary shadow-sm">
                <FontAwesomeIcon icon={faPlus}></FontAwesomeIcon>
                <span className="d-none d-md-inline ml-2">Nuovo piano di studio</span>
            </a>
        </h2>
        { props.proposals === undefined && <LoadingMessage>Caricamento dei piani in corso</LoadingMessage>}
        { (props.proposals !== undefined && props.proposals.length == 0) && <p>
            <Card>Nessun piano di studio presentato.</Card>
            </p> }
        { props.proposals !== undefined && 
        <div className="row">
            { props.proposals.map(
                p => <ProposalInfo root={props.root} csrfToken={props.csrfToken} 
                    key={"proposal-info-" + p.id} proposal={p}
                    onDeleteClicked={props.onProposalDeleteClicked}>
                </ProposalInfo>
            )
            }
        </div>
        }
    </div>;
}

export default ProposalsBlock;