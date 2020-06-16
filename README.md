# CAPS
[![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/master?label=master)](https://travis-ci.org/github/Unipisa/caps/) [![Travis (.org) branch](https://img.shields.io/travis/unipisa/caps/develop?label=develop)](https://travis-ci.org/github/Unipisa/caps/)

Questo repository contiene CAPS, il portale utilizzato per sottomettere ed approvare i piani di studio presso il Dipartimento di Matematica, Università di Pisa.




## Installazione
```
apt install composer
apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-ldap
apt install sqlite3  # for development
```

## Configurazione
```
cd app
ln -s app.default.php config/app.php # Configurazione locale
ln -s unipi.default.ini unipi.ini # In alternativa, aggiungere degli utenti di prova a scelta,
                                  # oppure configurare LDAP in modo opportuno.
composer install
```

## Sviluppo
Utilizziamo il *branching model* descritto qui: https://nvie.com/posts/a-successful-git-branching-model/ in particolare il branch *master* deve poter andare immediatamente in produzione mentre le modifiche non completamente testate andranno nel branch *develop*

```
cd app
git checkout develop
bin/cake migrations migrate # Crea o aggiorna il database
vendor/bin/phpunit # run unit tests
vendor/bin/phpunit --filter testLoginPage # run a single test
tail -f logs/*.log # display error messages 
bin/cake server & # run a development server
```

Per importare un dump vecchio del database è necessario prima migrare ad una versione
compatibile, e poi effettuare il resto delle migrazioni. Ad esempio:
```
bin/cake migrations migrate -t 20191217155946
sqlite3 caps.sqlite < dump.sql
bin/cake migrations migrate
```

Per aggiungere nuove migrazioni (un esempio):
```
bin/cake bake migration CreateProposals approved:boolean submitted:boolean frozen:boolean user_id:integer modified:datetime
```

## Inoltro dell'LDAP in locale

Per utilizzare un server LDAP disponibile in remoto (ad esempio '''idm2.unipi.it''' sulla macchina '''caps.dm.unipi.it''')
in locale, va inoltrata la porta tramite SSH:
```
ssh -L 1636:idm2.unipi.it:636 utente@caps.dm.unipi.it
```
e poi va modificato il file '''config/app.php''' per puntare all'LDAP locale, ad esempio:
```
; URI del server LDAP da interrogare
ldap_server_uri = ldaps://127.0.0.1:1636/

; Base DN dove cercare gli studenti
base_dn = "ou=people,dc=unipi,dc=it"
```

## struttura dati

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