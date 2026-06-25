import React, { useState, useEffect } from 'react';
import LoadingMessage from './LoadingMessage';
import Flash from './Flash';

function ThesisDefenseAdd({ root, apiRoot, csrfToken, caps, user, formTemplatesEnabled }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [flash, setFlash] = useState(null);
    const [submittedDefense, setSubmittedDefense] = useState(null);
    const [degreeSessionId, setDegreeSessionId] = useState('');
    const [phone, setPhone] = useState('');
    const [title, setTitle] = useState('');
    const [proposedSecondExaminers, setProposedSecondExaminers] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [advisors, setAdvisors] = useState([{ name: '', email: '' }]);
    const [attachments, setAttachments] = useState([]);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const [sessionsResponse, submittedResponse] = await Promise.all([
                fetch(`${apiRoot}degree_sessions?_limit=1000`, {
                    headers: getAuthHeaders()
                }),
                user?.id ? fetch(`${apiRoot}thesis_defenses?user_id=${user.id}&state=submitted&_limit=1`, {
                    headers: getAuthHeaders()
                }) : null
            ]);

            if (sessionsResponse.ok) {
                const data = await sessionsResponse.json();
                const sessions = data.data || [];
                const futureSessions = sessions
                    .filter(s => new Date(s.start_date) >= new Date())
                    .map(s => ({
                        id: s.id,
                        thesis_session_notes: s.degree?.thesis_session_notes || s.thesis_session_notes || null,
                        label: `${s.degree.name} — ${s.name} (${formatDate(s.start_date)})`
                    }))
                    .sort((a, b) => a.label.localeCompare(b.label));
                setSessions(futureSessions);
            }

            if (submittedResponse && submittedResponse.ok) {
                const data = await submittedResponse.json();
                const defenses = data.data || [];
                setSubmittedDefense(defenses.length > 0 ? defenses[0] : null);
            }
        } catch (e) {
            console.error('Failed to load degree sessions:', e);
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

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const addAdvisor = () => {
        setAdvisors([...advisors, { name: '', email: '' }]);
    };

    const removeAdvisor = (index) => {
        if (advisors.length > 1) {
            const newAdvisors = advisors.filter((_, i) => i !== index);
            setAdvisors(newAdvisors);
        }
    };

    const updateAdvisor = (index, field, value) => {
        const newAdvisors = [...advisors];
        newAdvisors[index] = { ...newAdvisors[index], [field]: value };
        setAdvisors(newAdvisors);
    };

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files));
    };

    const selectedSession = sessions.find(s => String(s.id) === String(degreeSessionId));
    const thesisSessionNotes = selectedSession?.thesis_session_notes;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFlash(null);

        try {
            // Filter out empty advisors
            const validAdvisors = advisors.filter(a => a.name.trim() || a.email.trim());
            
            const payload = {
                degree_session_id: parseInt(degreeSessionId),
                phone: phone,
                title: title,
                proposed_second_examiners: proposedSecondExaminers,
                public: isPublic,
                thesis_defense_advisors: validAdvisors
            };

            const response = await fetch(`${apiRoot}thesis_defenses`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (response.ok) {
                setFlash({ type: 'success', message: 'Domanda di partecipazione inviata con successo.' });
                // Redirect to user page after successful submission
                setTimeout(() => {
                    window.location.href = `${root}users/view/${user?.id || ''}`;
                }, 1500);
            } else {
                setFlash({ type: 'error', message: result.message || 'Impossibile inviare la domanda. Controllare i dati inseriti.' });
            }
        } catch (e) {
            setFlash({ type: 'error', message: 'Errore di connessione. Riprovare più tardi.' });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div id="thesis-defense-add"><LoadingMessage>Caricamento in corso...</LoadingMessage></div>;
    }

    if (submittedDefense) {
        return (
            <div id="thesis-defense-add" className="thesis-defense-add">
                <h1>Domanda di laurea</h1>
                <Flash
                    message="Hai già una domanda di laurea in attesa di valutazione. Potrai presentarne una nuova quando sarà approvata o respinta."
                    type="error"
                />
                <a
                    href={`${root}thesis-defenses/view/${submittedDefense.id}`}
                    className="btn btn-primary"
                >
                    Visualizza domanda
                </a>
                <a
                    href={`${root}users/view/${user?.id || ''}`}
                    className="btn btn-secondary ml-2"
                >
                    Torna al profilo
                </a>
            </div>
        );
    }

    return (
        <div id="thesis-defense-add" className="thesis-defense-add">
            <h1>Domanda di laurea</h1>
            {flash && <Flash message={flash.message} type={flash.type} onClose={() => setFlash(null)} />}
            {thesisSessionNotes && (
                <div className="card shadow border-left-info mb-3">
                    <div className="card-body" dangerouslySetInnerHTML={{ __html: thesisSessionNotes }} />
                </div>
            )}
            <div className="card mb-3">
                <div className="card-body">
                    <p className="text-muted">La domanda sarà inviata immediatamente agli amministratori. Dopo l'invio non sarà modificabile.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="degree_session_id">Sessione di laurea</label>
                            <select
                                id="degree_session_id"
                                className="form-control form-control"
                                value={degreeSessionId}
                                onChange={(e) => setDegreeSessionId(e.target.value)}
                                required
                            >
                                <option value="">Selezionare una sessione</option>
                                {sessions.map(s => (
                                    <option key={s.id} value={s.id}>{s.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="phone">Telefono</label>
                            <input
                                id="phone"
                                className="form-control"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Inserire un recapito telefonico"
                            />
                        </div>

                        <div className="form-group">
                            <label className="font-weight-bold" htmlFor="title">Titolo della tesi</label>
                            <textarea
                                id="title"
                                className="form-control"
                                rows={3}
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                placeholder="Inserire il titolo della tesi"
                            />
                        </div>

                        <div className="mt-2 mb-4">
                            <legend className="h5">Relatori</legend>
                            <div id="advisors-container">
                                {advisors.map((advisor, index) => (
                                    <div key={index} className="form-row advisor-row mb-2 d-flex align-items-center">
                                        <div className="col-md-5 pr-2">
                                            <input
                                                className="form-control"
                                                required
                                                type="text"
                                                value={advisor.name}
                                                onChange={(e) => updateAdvisor(index, 'name', e.target.value)}
                                                placeholder="Nome e cognome"
                                            />
                                        </div>
                                        <div className="col-md-5 pr-2">
                                            <input
                                                className="form-control"
                                                required
                                                type="email"
                                                value={advisor.email}
                                                onChange={(e) => updateAdvisor(index, 'email', e.target.value)}
                                                placeholder="Email"
                                            />
                                        </div>
                                        <div className="col-md-2">
                                            {advisors.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-danger remove-advisor w-100"
                                                    onClick={() => removeAdvisor(index)}
                                                >
                                                    Rimuovi
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                id="add-advisor"
                                className="btn btn-sm btn-outline-primary"
                                onClick={addAdvisor}
                            >
                                <i className="fas fa-plus mr-2"></i>Aggiungi relatore
                            </button>
                        </div>

                       <div className="form-group">
                            <label className="font-weight-bold" htmlFor="proposed_second_examiners">Controrelatori proposti</label>
                            <textarea
                                id="proposed_second_examiners"
                                className="form-control"
                                rows={3}
                                value={proposedSecondExaminers}
                                onChange={(e) => setProposedSecondExaminers(e.target.value)}
                                placeholder="Inserire eventuali controrelatori proposti"
                            />
                        </div>

                        <div className="form-group form-check">
                            <input
                                id="public"
                                className="form-check-input"
                                type="checkbox"
                                checked={isPublic}
                                onChange={(e) => setIsPublic(e.target.checked)}
                            />
                            <label className="form-check-label" htmlFor="public">
                                Autorizzo la pubblicazione delle informazioni sulla tesi sul sito web e sugli schermi informativi.
                            </label>
                        </div>                        

                        <div className="mt-4">
                            <label className="font-weight-bold" htmlFor="attachments">Allegati</label>
                            <input
                                type="file"
                                id="attachments"
                                multiple
                                className="form-control-file"
                                onChange={handleFileChange}
                            />
                            <small className="form-text text-muted">È possibile selezionare più file.</small>
                        </div>

                        <div className="mt-4">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting}
                                onClick={() => {
                                    if (!window.confirm('Inviare definitivamente la domanda?')) return false;
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm mr-2"></span>
                                        Invio in corso...
                                    </>
                                ) : 'Invia domanda'}
                            </button>
                            <a
                                href={`${root}users/view/${user?.id || ''}`}
                                className="btn btn-secondary ml-2"
                            >
                                Annulla
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ThesisDefenseAdd;
