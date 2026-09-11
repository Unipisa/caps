import React, { useState, useEffect } from 'react';
import LoadingMessage from './LoadingMessage';
import Flash from './Flash';

function formatDate(value, timezone) {
    if (!value) return 'Non ancora assegnata';
    const options = { dateStyle: 'short', timeStyle: 'short' };
    if (timezone) options.timeZone = timezone;
    return new Intl.DateTimeFormat('it-IT', options).format(new Date(value));
}

function ThesisDefenseView({ root, apiRoot, csrfToken, caps, user, defenseId, isAdmin }) {
    const [defense, setDefense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [flash, setFlash] = useState(null);

    useEffect(() => {
        if (defenseId) {
            loadDefense();
        }
    }, [defenseId]);

    const loadDefense = async () => {
        try {
            const response = await fetch(`${apiRoot}thesis_defenses/${defenseId}`, {
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            let data = {};
            try {
                data = await response.json();
            } catch (e) {
                // Ignore JSON parse errors
            }
            if (response.ok) {
                setDefense(data.data);
            } else {
                setFlash({ type: 'error', message: data.message || 'Impossibile caricare la domanda.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione. Riprovare più tardi.' });
        } finally {
            setLoading(false);
        }
    };

    const getAuthHeaders = () => {
        const headers = {};
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        if (caps && caps.adminToken) {
            headers['Authorization'] = `Bearer ${caps.adminToken}`;
        }
        return headers;
    };

    const stateLabels = {
        submitted: 'Inviata',
        approved: 'Approvata',
        rejected: 'Respinta'
    };

    const handleManage = () => {
        window.location.href = `${root}thesis-defenses/manage/${defenseId}`;
    };

    const handleApprove = async () => {
        if (!window.confirm('Approvare questa domanda di laurea?')) return;
        try {
            const response = await fetch(`${apiRoot}thesis_defenses/${defenseId}/approve`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            if (response.ok) {
                setFlash({ type: 'success', message: 'Domanda approvata con successo.' });
                loadDefense();
            } else {
                const data = await response.json();
                setFlash({ type: 'error', message: data.message || 'Impossibile approvare la domanda.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione.' });
        }
    };

    const handleReject = async () => {
        if (!window.confirm('Respingere questa domanda di laurea?')) return;
        try {
            const response = await fetch(`${apiRoot}thesis_defenses/${defenseId}/reject`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include'
            });
            if (response.ok) {
                setFlash({ type: 'success', message: 'Domanda respinta.' });
                loadDefense();
            } else {
                const data = await response.json();
                setFlash({ type: 'error', message: data.message || 'Impossibile respingere la domanda.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione.' });
        }
    };

    if (loading) {
        return <div id="thesis-defense-view"><LoadingMessage>Caricamento in corso...</LoadingMessage></div>;
    }

    if (!defense) {
        return <div id="thesis-defense-view"><Flash message="Domanda non trovata." type="error" /></div>;
    }

    const badgeClass = defense.state === 'approved' ? 'success' :
                       defense.state === 'rejected' ? 'danger' : 'warning';

    return (
        <div id="thesis-defense-view" className="thesis-defense-view">
            <h1>Domanda di partecipazione</h1>
            {flash && <Flash message={flash.message} type={flash.type} onClose={() => setFlash(null)} />}
            <div className="card shadow mb-3">
                <div className="card-body">
                    <dl className="row">
                        <dt className="col-sm-3">Studente</dt>
                        <dd className="col-sm-9">{defense.user?.name} ({defense.user?.number})</dd>

                        <dt className="col-sm-3">Telefono</dt>
                        <dd className="col-sm-9">{defense.phone || 'Non indicato'}</dd>

                        <dt className="col-sm-3">Corso e sessione</dt>
                        <dd className="col-sm-9">
                            {defense.degree_session?.degree?.name} — {defense.degree_session?.name},
                            {formatDateSession(defense.degree_session?.start_date)}
                        </dd>

                        <dt className="col-sm-3">Titolo</dt>
                        <dd className="col-sm-9">{defense.title}</dd>

                        <dt className="col-sm-3">Controrelatori proposti</dt>
                        <dd className="col-sm-9">{defense.proposed_second_examiners || 'Nessuno'}</dd>

                        <dt className="col-sm-3">Pubblicazione</dt>
                        <dd className="col-sm-9">{defense.public ? 'Autorizzata' : 'Non autorizzata'}</dd>

                        <dt className="col-sm-3">Stato</dt>
                        <dd className="col-sm-9">
                            <span className={`badge badge-${badgeClass}`}>
                                {stateLabels[defense.state] || defense.state}
                            </span>
                        </dd>

                        <dt className="col-sm-3">Relatori</dt>
                        <dd className="col-sm-9">
                            <ul className="mb-0">
                                {defense.thesis_defense_advisors?.map((advisor, index) => (
                                    <li key={index}>
                                        {advisor.name} — <a href={`mailto:${advisor.email}`}>{advisor.email}</a>
                                    </li>
                                ))}
                            </ul>
                        </dd>

                        <dt className="col-sm-3">Allegati</dt>
                        <dd className="col-sm-9">
                            {!defense.thesis_defense_attachments || defense.thesis_defense_attachments.length === 0 ? (
                                'Nessuno'
                            ) : (
                                <ul className="mb-0">
                                    {defense.thesis_defense_attachments.map((attachment, index) => (
                                        <li key={index}>
                                            <a href={`${apiRoot}thesis_defense_attachments/${attachment.id}/download`}
                                               target="_blank"
                                               rel="noopener noreferrer">
                                                {attachment.filename}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </dd>

                        <dt className="col-sm-3">Data e ora</dt>
                        <dd className="col-sm-9">
                            {defense.scheduled_at
                                ? `${formatDate(defense.scheduled_at, caps?.timezone)}${caps?.timezone ? ` (${caps.timezone})` : ''}`
                                : 'Non ancora assegnate'
                            }
                        </dd>

                        <dt className="col-sm-3">Sede</dt>
                        <dd className="col-sm-9">
                            {defense.venue || 'Non ancora assegnata'}
                        </dd>
                    </dl>
                </div>
            </div>

            {isAdmin && (defense.state === 'submitted' || defense.state === 'approved' || defense.state === 'rejected') && (
               <>
               <div className="card shadow mb-3">
                    <div className="card-body">
                        <h5 className="mb-3">Azioni amministratore</h5>
                        <button className="btn btn-primary mr-2" onClick={handleManage}>
                            <i className="fas fa-cog mr-2"></i>Gestisci domanda
                        </button>
                        {defense.state === 'submitted' && (
                            <>
                                <button className="btn btn-success mr-2" onClick={handleApprove}>
                                    <i className="fas fa-check mr-2"></i>Approva
                                </button>
                                <button className="btn btn-danger" onClick={handleReject}>
                                    <i className="fas fa-times mr-2"></i>Respingi
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <a href={`${root}thesis-defenses`} className="btn btn-secondary">
                    <i className="fas fa-arrow-left mr-2"></i>Torna alla lista
                </a>
                </>
            )}

        </div>
    );
}

function formatDateSession(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default ThesisDefenseView;
