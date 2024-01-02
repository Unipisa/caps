# Nuovo sviluppo CAPS api+react

Per provare il repository si può avviare un database mongo di prova con 
```
sudo docker-compose up
```
che poi è possibile interrogare direttamente con ```sudo docker-compose exec mongo mongosh```,
per eventualmente controllare se sono stati inseriti i dati. 

# import dati da mysql

Devi avere una chiave SSH per entrare sul server CAPS.
Allora puoi dare il comando:
```bash
cd api
bash migrate-mysql.sh
```

# avvio server side

Il codice del server si trova nella cartella `api`.
Avviare il server da un terminale

```bash
cd api
npm ci # una tantum
npm start
```
Se dà errore `TextEncoder is not defined` bisogna aggiornare `node`.
La versione 21 di node dà un deprecation warning con la libreria mongoose:
conviene usare node v20.9.0.

Per testare le API si può usare una applicazione 
come `postman`. 
Ma alcune prove si possono fare direttamente con curl (qui si usa jq per 
fare il pretty print del JSON):
```bash
$ curl -s -H 'Content-Type: application/json' \
    -X POST \
    -d '{ "name": "Analisi Numerica", "credits": 6, "sector": "MAT/08", "code": "AA112" }' \
    http://localhost:3000/api/v0/exams | jq
{
  "code": 200,
  "message": "OK"
}
```
... e poi
```bash
$ curl -s -H 'Content-Type: application/json' -X GET http://localhost:3000/api/v0/exams | jq
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "_id": "624402d236d1e6f756a31993",
      "name": "Analisi Numerica",
      "code": "AA112",
      "sector": "MAT/08",
      "credits": 6,
      "__v": 0
    }
  ]
}
```

# avvio lato client

Il codice `react` del client si trova nella cartella `frontend`.

Per compilare e tenere aggiornato il codice javascript durante lo sviluppo:
```bash
cd frontend
npm ci # una tantum
npm run watch:dev
```

Ora la pagina web si dovrebbe vedere qui: http://localhost:3000/

# struttura dei dati

Possibili princìpi da seguire:

* dovrà essere possibile migrare automaticamente i dati vecchi nella nuova struttura
* https://www.scylladb.com/glossary/nosql-design-principles/
* https://www.mongodb.com/nosql-explained/data-modeling

## Vecchia Struttura dati sql

    Attachment [attachments]
        id
        filename
        user -> User [user_id]
        proposal -> Proposal [proposal_id]
        data
        mimetype
        comment
        created

    ChosenExam [chosen_exams]
        id
        credits
        chosen_year
        exam -> Exam [exam_id]
        proposal -> Proposal [proposal_id]
        compulsory_group -> CompulsoryGroup [compulsory_group_id] (*) (!) 
        compulsory_exam -> CompulsoryExams [compulsory_exam_id] (*) (!) 
        free_choice_exam -> FreeChoiceExam [free_choice_exam_id] (*) (!) 
        (*) uno solo dei tre puo' essere non null: indica la corrispondenza dell'esame nel curriculum
        (*) se tutti e tre sono null vuol dire che l'esame non era previsto nel curriculum

    ChosenFreeChoiceExam [chosen_free_choice_exams]
        id
        name
        credits
        chosen_year
        proposal -> Proposal [proposal_id]

    CompulsoryExam [compulsory_exams]
        id
        year
        position
        exam -> Exam [exam_id]
        curriculum -> Curriculum [curriculum_id]

    CompulsoryGroup [compulsory_groups]
        id
        year
        position
        group -> Group [group_id]
        curriculum -> Curriculum [curriculum_id]

    Curriculum [curricula]
        id
        name
        notes
        degree -> Degree [degree_id]
        proposals <- Proposals 
        free_choice_exams <- FreeChoiceExam
        compulsory_exams <- CompulsoryExam
        compulsory_groups <- CompulsoryGroup

    Degree [degrees]
        id
        name
        academic_year
        years
        enabled
        enable_sharing
        approval_confirmation
        rejection_confirmation
        submission_confirmation
        approval_message
        rejection_message
        submission_message
        free_choice_message
        <- Curricula
        <- Group

    Exam [exams]
        id
        name
        code
        sector
        credits
        <-> Group [exams_groups]

    FreeChoiceExam [free_choice_exams]
        id
        year
        position
        curriculum -> Curriculum [curriculum_id]
        group -> Group [group_id, NULL]

    Form [forms]
        id
        form_template -> FormTemplate
        user > User
        state
        date_submitted
        date_managed
        data

    FormTemplate [form_templates]
        id
        name
        text
        enabled
        notify_emails
        require_approval

    Group [groups]
        id
        degree -> Degree [degree_id]
        name
        <-> Exam [exams_groups]

    ProposalAuth [proposal_auths]
        id
        email
        secret
        created
        proposal -> Proposal [proposal_id]

    Proposal
        id
        modified (date)
        state in ['draft','submitted','approved','rejected']
        submitted_date (date)
        approved_date (date)
        user -> User [user_id]
        curriculum -> Curriculum [curriculum_id]
        <- ChosenExam
        <- ChosenFreeChoiceExam
        <- ProposalAuth
        <- Attachment

    Settings [settings]
        id
        field
        value
        fieldtype

    Tag [tags]
        id
        name
        <-> Exam [tags_exams]

    User [users]
        id
        username
        name
        number
        givenname
        surname
        email
        admin (bool)
        password (encrypted)

(!) nel database manca il constraint!!
