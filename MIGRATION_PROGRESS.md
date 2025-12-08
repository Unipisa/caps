# Migrazione CAPS: CakePHP → Next.js + GraphQL

## Panoramica del Progetto
Questo progetto rappresenta la migrazione completa del sistema CAPS (Sistema di Gestione Piani di Studio) da CakePHP/Node.js a una moderna architettura Next.js con TypeScript e GraphQL.

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