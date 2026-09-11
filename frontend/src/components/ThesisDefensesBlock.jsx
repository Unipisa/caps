import React from 'react';
import LoadingMessage from './LoadingMessage';

const stateLabels = {
    submitted: 'Inviata',
    approved: 'Approvata',
    rejected: 'Respinta'
};

function formatDate(value, timezone) {
    if (!value) return null;
    const options = { dateStyle: 'short', timeStyle: 'short' };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('it-IT', options).format(new Date(value));
}

class ThesisDefensesBlock extends React.Component {
    render() {
        const defenses = this.props.defenses;
        return <div className={this.props.className}>
            <h2 className="d-flex">
                <span className="mr-auto">Domande di laurea</span>
                <a href={this.props.root + 'thesis-defenses/add'} className="my-auto btn btn-sm btn-primary shadow-sm">
                    <i className="fas fa-plus"></i>
                    <span className="d-none d-md-inline ml-2">Nuova domanda</span>
                </a>
            </h2>
            {defenses === undefined && <LoadingMessage>Caricamento delle domande in corso</LoadingMessage>}
            {defenses !== undefined && defenses.length === 0 && <p>Nessuna domanda presentata.</p>}
            {defenses !== undefined && defenses.length > 0 && <div className="row">
                {defenses.map(defense => <div className="col-md-6 col-xl-4 mb-4" key={'thesis-defense-' + defense.id}>
                    <div className="card shadow border-left-primary clickable-card">
                        <div className="card-body">
                            <div className="mb-2 mr-auto">
                                <span className={'badge badge-' + (defense.state === 'approved' ? 'success' : defense.state === 'rejected' ? 'danger' : 'warning')}>
                                        {stateLabels[defense.state] || defense.state}
                                </span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <h3 className="h5">{defense.degree_session.name}</h3>
                                
                            </div>
                            <div className="text-muted mb-2">{defense.degree_session.degree.name}</div>
                            <p className="mb-2">{defense.title}</p>
                            {defense.scheduled_at && <p className="mb-0"><strong>Data:</strong> {formatDate(defense.scheduled_at, this.props.timezone)}{this.props.timezone && <> ({this.props.timezone})</>}</p>}
                            {defense.venue && <p className="mb-0"><strong>Sede:</strong> {defense.venue}</p>}
                            <a className="btn btn-sm btn-primary mt-3" href={this.props.root + 'thesis-defenses/view/' + defense.id}>Dettagli</a>
                        </div>
                    </div>
                </div>)}
            </div>}
        </div>;
    }
}

export default ThesisDefensesBlock;
