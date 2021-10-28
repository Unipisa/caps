# Informazioni utili per sviluppatori

## Preparazione dell'ambiente di sviluppo

CAPS è sviluppato utilizzando il framework [CakePHP](https://cakephp.org) per il backend, 
ed alcune librerie Javascript per (parte) del frontend. Per un ambiente di sviuppo locale
è necessario avere a disposizione PHP, NPM, e un database (Sqlite3 può andare bene). 

## Installazione
```bash
apt install composer npm
apt install php-mbstring php-intl php-xml php-sqlite3 php-mysql php-zip php-ldap php-gd
apt install sqlite3  # for development
```

## Configurazione di CakePHP
```bash
cd app
cp config/app.default.php config/app.php # Configurazione locale, richiede di impostare i parametri per LDAP
composer install
```
Per utilizzare un server LDAP con certificato SSL non valido, ad esempio perchè inoltrato
tramite una porta locale, è necessario modificare il parametro ```verify_cert``` a false in 
```app.php``` (si trovano più dettagli sotto). Ovviamente, questa configurazione non 
è ideale in produzione. 
Per lo sviluppo in locale, se non si vuole configurare LDAP, è possibile 
inserire le credenziali degli utenti direttamente nel file di configurazione.

Una volta fatto il login con un utente, è possibile renderlo amministratore con il comando
```bash
bin/cake grant-admin username
```
Una volta che è presente il primo amministratore, gli altri possono essere creati
tramite interfaccia web. 

Se non si vuole configurare l'autenticazione LDAP si possono inserire gli username e password
degli utenti in una variabile d'ambiente. 
Ad esempio per avere due utenti con password uguale allo username:
```
export LDAP_ADMINS=admin
export LDAP_USERS_PASSWD=admin:admin,user:user
```

## Inoltro dell'LDAP in locale

Per utilizzare un server LDAP disponibile in remoto (ad esempio '''idm2.unipi.it''' sulla macchina '''caps.dm.unipi.it''')
in locale, va inoltrata la porta tramite SSH:
```bash
ssh -L 1636:idm2.unipi.it:636 utente@caps.dm.unipi.it
```
e poi va modificato il file '''config/app.php''' per puntare all'LDAP locale, ad esempio:
```php
'UnipiAuthenticate' => [
  'ldap_server_uri' => 'ldaps://127.0.0.1:1636/',
  'base_dn' => "ou=people,dc=unipi,dc=it",
  'verify_cert' => false
]
```
I parametri opzionali ```admin``` e ```fakes``` possono essere utilizzati per forzare
alcuni utenti ad essere amministratori, o per creare utenti fittizzi. 

Questa procedura viene gestita in automatico dall'immagine [Docker](docker/README.md). 

## Creazione files HTML e JS

Il template, basato su SB-Admin-2, (CSS e JS) si trova nella cartella ```html```. 
Per compilare i file JS e CSS è necessario entrare nella cartella ed usare ```npm```. 

```bash
cd html/
npm install
npm run test # run js unit tests
npm run deploy # compiles js and css files
npm run deploy:dev # as above but for development
```

Dopo la prima compilazione, può essere conveniente usare il comando 
per ricompilare automaticamente i file JS e SCSS quando vengono modificati:

```
npm run watch
``` 

I file sorgente si trovano rispettivamente 
nelle cartelle ```html/scss``` e ```html/src```.

Il comando ```deploy``` esegue ```npm run build``` e ```npm run install``` che compilano e 
copiano i file CSS e JS all'interno di ../app/webroot/, rispettivamente. Per comodità, i file
già compilati sono inclusi nel repository. 


## Esecuzione del backend

Per avviare il server di sviluppo si possono usare i seguenti comandi. È necessario aver prima compilato
i file JS e CSS. 

```bash
cd app
bin/cake migrations migrate # applica eventuali migrazioni al database
vendor/bin/phpunit # run php unit tests
bin/cake server & # run a development server
```

## Branching model
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

## Upgrade da CAPS < 1.0.0

Per importare un dump vecchio del database (di CAPS < 1.0.0) è necessario prima migrare ad una versione
compatibile, e poi effettuare il resto delle migrazioni. Ad esempio:
```bash
bin/cake migrations migrate -t 20191217155946
sqlite3 caps.sqlite < dump.sql
bin/cake migrations migrate
```

## Struttura dati

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

(!) nel database manca il constraint!!
