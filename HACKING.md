# Informazioni utili per sviluppatori


## Sviluppo
Utilizziamo il *branching model* descritto qui: https://nvie.com/posts/a-successful-git-branching-model/ in particolare il branch *master* deve poter andare immediatamente in produzione mentre le modifiche non completamente testate andranno nel branch *develop*

```bash
cd app
git checkout develop
bin/cake migrations migrate # Crea o aggiorna il database
vendor/bin/phpunit # run unit tests
vendor/bin/phpunit --filter testLoginPage # run a single test
tail -f logs/*.log # display error messages 
bin/cake server & # run a development server
```


## Istruzioni per CakePHP

Per aggiungere nuove migrazioni (un esempio):
```bash
bin/cake bake migration CreateProposals approved:boolean submitted:boolean frozen:boolean user_id:integer modified:datetime
```

## Template

Il template, basato su SB-Admin-2, (CSS e JS) si trova nella cartella ```html```. È possibile compilarlo con i comandi:
```bash
cd html/
npm install
npm run deploy
```
Il comando ```deploy``` esegue ```npm run build``` e ```npm run install``` che compilano e 
copiano i file CSS e JS all'interno di ../app/webroot/, rispettivamente. Per comodità, i file
già compilati sono inclusi nel repository. 


## Struttura dati

    Attachment
        id
        filename
        user -> User
        proposal -> Proposal
        data
        mimetype
        comment
        created

    ChosenExam
        id
        credits
        chosen_year
        exam -> Exam
        proposal -> Proposal
        compulsory_group -> CompulsoryGroup (*) (!) 
        compulsory_exam -> CompulsoryExams (*) (!) 
        free_choice_exam -> FreeChoiceExam (*) (!) 
        (*) uno solo dei tre puo' essere non null: indica la corrispondenza dell'esame nel curriculum
        (*) se tutti e tre sono null vuol dire che l'esame non era previsto nel curriculum

    ChosenFreeChoiceExam
        id
        name
        credits
        chosen_year
        proposal -> Proposal
        free_choice_exam -> FreeChoiceExam (*) (!)
        (*) se non null indica la corrispondenza dell'esame nel curriculum. Ma attualmente l'utente non puo' inserirlo, infatti è sempre null!
        (*) se null significa che e' un esame non in databse e  non previsto dal curriculum.

    CompulsoryExam
        id
        year
        position
        exam -> Exam
        curriculum -> Curriculum

    CompulsoryGroup
        id
        year
        position
        group -> Group
        curriculum -> Curriculum

    Curriculum
        id
        name
        academic_year
        notes
        degree -> Degrees (!)
        proposals <- Proposals
        free_choice_exams <- FreeChoiceExam
        compulsory_exams <- CompulsoryExam
        compulsory_groups <- CompulsoryGroup
        <- Proposal

    Exam
        id
        name
        code
        sector
        credits
        <-> Exam

    FreeChoiceExam
        id
        year
        position
        curriculum -> Curriculum

    Group
        id
        name
        <-> Exam

    ProposalAuth
        id
        email
        secret
        created
        proposal -> Proposal

    Proposal
        id
        modified
        state
        submitted_date
        approved_date
        user -> User
        curriculum -> Curriculum
        <- ChosenExam
        <- ChosenFreeChoiceExam
        <- ProposalAuth
        <- Attachment

    Settings
        id
        field
        value
        fieldtype

    Tag
        id
        name
        <-> Exam

    User
        id
        username
        name
        number
        givenname
        surname
        email
        admin

(!) nel database manca il constraint!!
