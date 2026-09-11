import React, { useState, useEffect } from 'react';
import LoadingMessage from './LoadingMessage';
import Flash from './Flash';

function formatDateLocal(dateStr, timezone) {
    if (!dateStr) return '';
    // API timestamps without an explicit offset are stored in UTC.
    const utcValue = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(dateStr) ? dateStr : `${dateStr}Z`;
    const date = new Date(utcValue);
    if (isNaN(date.getTime())) return '';

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone || 'UTC',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

function ThesisDefenseManage({ root, apiRoot, csrfToken, caps, user, defenseId }) {
    const [defense, setDefense] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [flash, setFlash] = useState(null);
    const [state, setState] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [venue, setVenue] = useState('');

    useEffect(() => {
        if (defenseId) {
            loadDefense();
        }
    }, [defenseId]);

    const loadDefense = async () => {
        try {
            const response = await fetch(`${apiRoot}thesis_defenses/${defenseId}`, {
                headers: getAuthHeaders()
            });
            if (response.ok) {
                const data = await response.json();
                setDefense(data.data);
                setState(data.data.state || '');
                setVenue(data.data.venue || '');
                
                setScheduledAt(formatDateLocal(data.data.scheduled_at, caps?.timezone));
            } else {
                const data = await response.json();
                setFlash({ type: 'error', message: data.message || 'Impossibile caricare la domanda.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione. Riprovare più tardi.' });
        } finally {
            setLoading(false);
        }
    };

    const getAuthHeaders = () => {
        const headers = { 'Content-Type': 'application/json' };
        if (csrfToken) {
            headers['X-CSRF-Token'] = csrfToken;
        }
        if (caps && caps.adminToken) {
            headers['Authorization'] = `Bearer ${caps.adminToken}`;
        }
        return headers;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFlash(null);

        try {
            const payload = {
                state: state,
                venue: venue,
            };
            if (scheduledAt) {
                // The API interprets this wall time in the configured timezone and converts it to UTC.
                payload.scheduled_at = scheduledAt;
            }

            const response = await fetch(`${apiRoot}thesis_defenses/${defenseId}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                setFlash({ type: 'success', message: 'Domanda aggiornata con successo.' });
                loadDefense();
            } else {
                setFlash({ type: 'error', message: result.message || 'Impossibile aggiornare la domanda.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione. Riprovare più tardi.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div id="thesis-defense-manage"><LoadingMessage>Caricamento in corso...</LoadingMessage></div>;
    }

    if (!defense) {
        return <div id="thesis-defense-manage"><Flash message="Domanda non trovata." type="error" /></div>;
    }

    const stateLabels = {
        submitted: 'Da valutare',
        approved: 'Approvata',
        rejected: 'Respinta'
    };

    return (
        <div id="thesis-defense-manage" className="thesis-defense-manage">
            <h1>Gestione domanda di partecipazione</h1>
            {flash && <Flash message={flash.message} type={flash.type} onClose={() => setFlash(null)} />}
            
            {/* Read-only details */}
            <div className="card mb-3">
                <div className="card-body">
                    <dl className="row">
                        <dt className="col-sm-3">Studente</dt>
                        <dd className="col-sm-9">{defense.user?.name} ({defense.user?.number})</dd>

                        <dt className="col-sm-3">Telefono</dt>
                        <dd className="col-sm-9">{defense.phone || 'Non indicato'}</dd>

                        <dt className="col-sm-3">Corso e sessione</dt>
                        <dd className="col-sm-9">
                            {defense.degree_session?.degree?.name} — {defense.degree_session?.name}
                        </dd>

                        <dt className="col-sm-3">Titolo</dt>
                        <dd className="col-sm-9">{defense.title}</dd>

                        <dt className="col-sm-3">Controrelatori proposti</dt>
                        <dd className="col-sm-9">{defense.proposed_second_examiners || 'Nessuno'}</dd>

                        <dt className="col-sm-3">Pubblicazione</dt>
                        <dd className="col-sm-9">{defense.public ? 'Autorizzata' : 'Non autorizzata'}</dd>

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
                    </dl>
                </div>
            </div>

            {/* Editable management form */}
            <div className="card mb-3">
                <div className="card-body">
                    <form onSubmit={handleSave}>
                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="state">Stato</label>
                            <select
                                id="state"
                                className="form-control"
                                value={state}
                                onChange={(e) => setState(e.target.value)}
                            >
                                <option value="submitted">Da valutare</option>
                                <option value="approved">Approvata</option>
                                <option value="rejected">Respinta</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="scheduled_at">
                                Data e ora della discussione ({caps?.timezone || 'UTC'})
                            </label>
                            <input
                                id="scheduled_at"
                                type="datetime-local"
                                className="form-control"
                                value={scheduledAt}
                                onChange={(e) => setScheduledAt(e.target.value)}
                            />
                            <small className="form-text text-muted">
                                Inserire l'orario nel fuso orario {caps?.timezone || 'UTC'}.
                            </small>
                        </div>

                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="venue">Sede / aula</label>
                            <input
                                id="venue"
                                type="text"
                                className="form-control"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                placeholder="Inserire la sede o l'aula"
                            />
                        </div>

                        <div className="mt-3">
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2"></span>
                                        Salvataggio...
                                    </>
                                ) : 'Salva'}
                            </button>
                            <a href={`${root}thesis-defenses`} className="btn btn-secondary ml-2">
                                Annulla
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ThesisDefenseManage;
