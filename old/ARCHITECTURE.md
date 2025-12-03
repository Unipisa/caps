# CAPS - Sistema per la Compilazione Assistita di Piani di Studio

## Panoramica del Progetto

CAPS (Compilazione Assistita Piani di Studio) è un sistema sviluppato per il Dipartimento di Matematica dell'Università di Pisa per assistere gli studenti nella compilazione dei loro piani di studio. Il progetto è attualmente in fase di transizione da una vecchia architettura PHP/CakePHP verso una nuova architettura moderna basata su Node.js/Express e React.

## Architettura del Sistema

### 1. Versione Corrente (in sviluppo)

Il sistema è composto da tre componenti principali:

#### Backend API (Node.js/Express + MongoDB)
- **Cartella**: `/api/`
- **Tecnologie**: 
  - Node.js con TypeScript
  - Express.js per il server HTTP
  - MongoDB con Mongoose per il database
  - Passport.js per l'autenticazione
  - Express-session per la gestione delle sessioni
- **Struttura**:
  - `index.ts`: Entry point dell'applicazione
  - `models/`: Schema Mongoose per entità (User, Proposal, Exam, etc.)
  - `controllers/`: Controller REST per gestire le API
  - `router.js`: Configurazione delle route
  - `exceptions/`: Gestione eccezioni personalizzate
  - `webroot/`: File statici serviti dal backend

#### Frontend React
- **Cartella**: `/frontend/`
- **Tecnologie**:
  - React 17.x
  - React Router per la navigazione
  - Bootstrap 4 per lo styling
  - Webpack per il bundling
  - SCSS per gli stili
- **Struttura**:
  - `src/`: Codice sorgente React
  - `pages/`: Componenti pagina principali
  - `modules/`: Moduli di utilità e API client
  - `scss/`: File di stile SCSS

#### Database MongoDB
- **Tipo**: NoSQL (MongoDB 5)
- **Configurazione**: Docker Compose per lo sviluppo
- **Migrazione**: Sistema per importare dati dal vecchio database MySQL

### 2. Versione Legacy (PHP/CakePHP)

La vecchia versione si trova nella cartella `/backend/` e utilizza:
- CakePHP 4.x
- MySQL/MariaDB
- PHP 7.4+
- Architettura MVC tradizionale

## Modello Dati

### Entità Principali

1. **User (Utente)**
   - Informazioni studente (nome, cognome, matricola, email)
   - Credenziali di accesso
   - Ruolo amministratore

2. **Proposal (Piano di Studio)**
   - Stato: draft, submitted, approved, rejected
   - Riferimenti a studente e curriculum
   - Date di modifica, sottomissione, approvazione
   - Lista di esami scelti
   - Allegati

3. **Curriculum**
   - Nome del curriculum
   - Riferimento al corso di laurea
   - Esami obbligatori e gruppi di scelta

4. **Degree (Corso di Laurea)**
   - Nome del corso
   - Anno accademico
   - Configurazioni per messaggi e approvazioni

5. **Exam (Esame)**
   - Nome, codice, settore scientifico
   - Crediti formativi
   - Associazioni con gruppi

6. **Attachment (Allegato)**
   - File associati ai piani di studio
   - Metadati (tipo MIME, commenti)

7. **Form/FormTemplate**
   - Moduli personalizzabili per richieste specifiche
   - Template con campi configurabili

## API REST

### Endpoint Principali

- `GET/POST/PATCH/DELETE /api/v1/proposals` - Gestione piani di studio
- `GET /api/v1/users` - Gestione utenti
- `GET /api/v1/exams` - Catalogo esami
- `GET /api/v1/curricula` - Gestione curricula
- `GET /api/v1/degrees` - Gestione corsi di laurea
- `GET/POST /api/v1/forms` - Gestione moduli
- `GET /api/v1/dashboard` - Statistiche e dashboard

### Autenticazione
- Sessioni basate su cookies
- Supporto per autenticazione UniPi (LDAP/OAuth2)
- Livelli di accesso: studente e amministratore

## Funzionalità Principali

### Per gli Studenti
1. **Compilazione Piano di Studio**
   - Selezione esami da catalogo
   - Rispetto vincoli curriculum
   - Calcolo automatico crediti
   - Salvataggio bozze

2. **Gestione Allegati**
   - Upload documenti
   - Associazione con piani di studio
   - Download e visualizzazione

3. **Workflow Approvazione**
   - Sottomissione piani
   - Tracking stato approvazione
   - Comunicazioni via email

### Per gli Amministratori
1. **Gestione Catalogo**
   - Configurazione corsi di laurea
   - Definizione curricula
   - Gestione esami e gruppi

2. **Processo Approvazione**
   - Revisione piani sottomessi
   - Approvazione/rigetto con commenti
   - Statistiche e report

3. **Configurazione Sistema**
   - Messaggi personalizzati
   - Template moduli
   - Gestione utenti

## Deployment e Configurazione

### Sviluppo
```bash
# Avvio database MongoDB
sudo docker-compose up

# Avvio backend API
cd api
npm ci
npm start

# Avvio frontend (in sviluppo)
cd frontend
npm ci
npm run watch:dev
```

### Configurazione
- File `.env` per variabili d'ambiente
- Configurazione CORS per domini autorizzati
- Configurazione SMTP per notifiche email
- Chiavi di accesso per integrazione UniPi

### Migrazione Dati
- Script `migrate-mysql.sh` per importare dati dal vecchio sistema
- Conversione da struttura relazionale a NoSQL
- Preservazione integrità referenziale

## Sicurezza

1. **Autenticazione e Autorizzazione**
   - Hashing password con Passport
   - Controllo accessi basato su ruoli
   - Validazione permessi per ogni endpoint

2. **Protezioni**
   - CSRF protection
   - Validazione input
   - Sanitizzazione dati
   - Rate limiting (configurabile)

3. **Privacy**
   - Controllo accesso ai dati personali
   - Logging azioni amministrative
   - Gestione consensi

## Tecnologie e Dipendenze

### Backend
- `express`: Framework web
- `mongoose`: ODM per MongoDB
- `passport`: Sistema autenticazione
- `multer`: Upload file
- `morgan`: Logging HTTP
- `dotenv`: Gestione variabili ambiente

### Frontend
- `react`: Libreria UI
- `react-router-dom`: Routing client-side
- `react-bootstrap`: Componenti UI
- `webpack`: Bundling e build
- `sass`: Preprocessing CSS

### Sviluppo
- `typescript`: Type checking
- `nodemon`: Auto-restart server
- `docker-compose`: Orchestrazione servizi

## Versioning e Licenza

- **Versione Corrente**: 3.0.0 (nuovo sistema)
- **Versione Legacy**: 2.12.4 (sistema CakePHP)
- **Licenza**: AGPL-3.0-or-later
- **Repository**: Unipisa/caps (branch: caps-api)

## Note per Sviluppatori

### Convenzioni Codice
- TypeScript per il backend
- Componenti React funzionali con hooks
- Denominazione REST-ful per API
- Gestione errori centralizzata

### Testing
- Framework di test configurato ma non implementato
- Necessario sviluppare suite test unitari e integrazione

### Performance
- Paginazione per liste lunghe
- Lazy loading componenti React
- Caching per dati statici (esami, curricula)
- Ottimizzazioni query MongoDB

### Roadmap
1. Completamento migrazione da CakePHP
2. Implementazione test suite
3. Ottimizzazioni performance
4. Documentazione API completa
5. Deploy in produzione

## Contatti Sviluppo

- **Autori**: Francesco Baldino, Emanuele Paolini, Leonardo Robol
- **Organizzazione**: Università di Pisa - Dipartimento di Matematica
- **Scopo**: Sistema interno per gestione piani di studio
