# Migrazione CAPS: CakePHP → Next.js + GraphQL

## Panoramica del Progetto
Questo progetto rappresenta la migrazione completa del sistema CAPS (Sistema di Gestione Piani di Studio) da CakePHP/Node.js a una moderna architettura Next.js con TypeScript e GraphQL.

## ⚠️ Avviso Importante: Mantenimento dell'Aspetto Originale
**L'aspetto esteriore del progetto deve rimanere identico all'originale.** Durante la migrazione e lo sviluppo futuro, fare sempre riferimento alla struttura e all'aspetto del progetto originale conservato nella directory `old/`. Questo include:

- Layout e disposizione degli elementi
- Schema colori e tema Bootstrap
- Icone e risorse statiche
- Struttura delle pagine e navigazione
- Comportamento interattivo dell'interfaccia

Prima di apportare qualsiasi modifica al frontend, consultare i file nella directory `old/frontend/` e `old/api/webroot/` per garantire la fedeltà visiva al design originale. La migrazione tecnica non deve compromettere l'esperienza utente consolidata.

## Struttura del Progetto Originale
Il codice del progetto originale è conservato nella directory `old/` e rappresenta l'implementazione precedente basata su CakePHP/Node.js. Questa struttura fornisce il contesto per la migrazione e serve come riferimento per verificare la completezza della conversione.

### Directory `old/`
- **ARCHITECTURE.md**: Documentazione architetturale del progetto originale
- **docker-compose-production.yml** e **docker-compose.yml**: Configurazioni Docker per ambiente di produzione e sviluppo
- **Dockerfile**: Immagine Docker per il deployment
- **LICENSE** e **README.md**: Documentazione legale e principale del progetto originale

#### Sottodirectory `api/`
Contiene il backend API originale:
- **index.ts**: Punto di ingresso principale dell'API
- **middlewares.js**: Middleware per l'autenticazione e gestione richieste
- **migrate-mysql.js** e **migrate-mysql.sh**: Script per migrazione da MySQL
- **package.json**: Dipendenze Node.js del backend
- **router.js**: Definizione delle rotte API
- **test.js**: File di test
- **unipiAuth.js**: Modulo di autenticazione Unipi

##### `controllers/`
Controller per gestire le richieste API:
- AttachmentController.js
- CommentController.js
- CurriculaController.js
- DegreesController.js
- ExamsController.js
- FormsController.js
- FormTemplates.js
- ModelController.js
- ProposalsController.js
- SettingsController.js
- UsersController.js

##### `exceptions/`
- ApiException.js: Gestione errori API

##### `models/`
Modelli dati originali (JavaScript):
- Attachment.js
- Comment.js
- Curriculum.js
- CurriculumExam.js
- Degree.js
- Exam.js
- Form.js
- FormTemplate.js
- Proposal.js
- ProposalSchema.js
- Settings.js
- User.js
- Validators.js

##### `util/`: Utilità varie
##### `webroot/`: File statici del backend
- index.html
- robots.txt
- files/, img/, js/: Risorse statiche

#### Sottodirectory `frontend/`
Contiene il frontend originale:
- **deploy-plugin.js**: Plugin per deployment
- **index.html**: Pagina principale
- **package.json**: Dipendenze frontend
- **webpack.config.dev.js** e **webpack.config.js**: Configurazioni Webpack per sviluppo e produzione

##### `js/`
- caps.js, caps.min.js: Codice JavaScript principale e minificato

##### `scss/`
- caps.scss, forms.scss, main.scss: Fogli di stile SCSS

##### `src/`
- caps.js: Codice sorgente principale
- components/, modules/, old_components/, pages/: Struttura componenti e pagine

##### `test/`
- test.js: File di test frontend

##### `dev-webroot/`: Risorse per sviluppo
- robots.txt, files, img, js, index.html

Questa struttura del progetto originale evidenzia l'architettura precedente basata su separazione backend/frontend con CakePHP/Node.js, che è stata completamente rifattorizzata nella nuova implementazione Next.js + GraphQL.

## Architettura Tecnica
- **Frontend**: Next.js 15 con App Router e TypeScript
- **Backend API**: GraphQL Yoga (sostituto di Apollo per migliore compatibilità)
- **Database**: MongoDB con Mongoose ODM
- **UI Framework**: React Bootstrap con FontAwesome icons
- **Styling**: CSS personalizzato basato sul tema Bootstrap originale

## Modelli Dati Migrati
Tutti i modelli sono stati convertiti da JavaScript a TypeScript:

### ✅ Completati
- **User.ts**: Modello utente con autenticazione passport-local-mongoose
- **Exam.ts**: Modello esami
- **Degree.ts**: Modello corsi di laurea
- **Curriculum.ts**: Modello curricula
- **Proposal.ts**: Modello piani di studio (con discriminatori commentati per problemi di compilazione TypeScript)

### 🔄 In Corso
- **ProposalSchema.ts**: Schema complesso con discriminatori per esami e allegati (problemi di compilazione TypeScript)

## API GraphQL Implementata
Endpoint: `/api/graphql`

### Query Disponibili
- `users`: Lista utenti con paginazione
- `exams`: Lista esami
- `degrees`: Lista corsi di laurea
- `curricula`: Lista curricula
- `proposals`: Lista piani di studio

### Mutation Disponibili
- `createUser`: Creazione nuovo utente

## GraphQL Codegen
Il progetto utilizza GraphQL Code Generator per generare automaticamente tipi TypeScript dallo schema GraphQL, garantendo type safety nelle operazioni GraphQL.

### Configurazione
- **File di configurazione**: `codegen.yml`
- **Schema GraphQL**: `src/app/api/graphql/schema.gql`
- **File generato**: `src/generated/graphql.ts`

### Plugin Utilizzati
- `typescript`: Genera tipi TypeScript per lo schema GraphQL
- `typescript-operations`: Genera tipi per query e mutazioni specifiche

### Comando per Generare
```bash
npm run codegen
```

### Utilizzo nel Progetto
I tipi generati vengono importati nei componenti React per type checking delle risposte GraphQL. Le query GraphQL sono definite manualmente nei componenti per maggiore controllo.
- Autocompletamento in IDE
- Prevenzione errori di runtime dovuti a mismatch di tipi

## Layout e UI
Riproduzione completa del layout originale del progetto CakePHP:

### Componenti Implementati
- **Layout.tsx**: Layout principale con sidebar e topbar
- **NavBar.tsx**: Sidebar di navigazione con menu gerarchico
- **TopBar.tsx**: Header con logo e menu utente
- **Dashboard.tsx**: Dashboard con statistiche (card con conteggi entità)

### Stile e Tema
- Tema Bootstrap originale riprodotto
- FontAwesome icons integrati
- CSS personalizzato per layout responsive
- Color scheme: sfondo chiaro (#f8f9fc), sidebar blu primary

## Risorse Statiche
### Immagini Copiate
- `cherubino_white.png`: Logo sidebar (60x60px)
- `logo_blue_small.png`: Logo topbar

### Documentazione
- `ARCHITECTURE.md`: Documentazione architetturale
- `LICENSE`: Licenza del progetto
- `README.md`: Documentazione principale

## Problemi Risolti
1. **Compatibilità GraphQL**: Apollo → GraphQL Yoga per App Router
2. **CSS Mancante**: Aggiunto Bootstrap e FontAwesome CSS
3. **Immagini 404**: Copiate risorse mancanti da progetto originale
4. **Layout Schiacciato**: CSS personalizzato per riprodurre dimensioni originali
5. **Componenti Server**: Convertiti a Client Components per interattività

## Stato Attuale
- ✅ Setup Next.js con TypeScript
- ✅ Modelli dati migrati
- ✅ API GraphQL funzionante
- ✅ Layout Bootstrap riprodotto
- ✅ Dashboard con statistiche
- ✅ Immagini e documentazione copiate

## Prossimi Passi
1. Risolvere discriminatori TypeScript in ProposalSchema
2. Implementare autenticazione completa
3. Aggiungere mutations GraphQL per CRUD completo
4. Creare pagine per gestione entità (utenti, esami, curricula, etc.)
5. Implementare filtri e ricerca
6. Aggiungere gestione allegati
7. Testing e ottimizzazioni

## Comandi Importanti
```bash
# Avvio sviluppo
npm run dev

# Build produzione
npm run build

# Type checking
npm run type-check

# API GraphQL
http://localhost:3000/api/graphql
```

## Note Tecniche
- Database MongoDB esistente riutilizzato
- Modelli Mongoose mantenuti compatibili
- API REST originale preservata in `old/api/`
- Frontend originale preservato in `old/frontend/`
- Possibilità di rollback completo se necessario