# Documentazione delle API REST

Sono attualmente in sviluppo delle API REST per CAPS, che vengono usate 
da (buona parte) del codice Javascript e in particolare la parte di 
interfaccia utente sviluppata in React. 

## Autenticazione amministrativa con token

Se l'istanza configura `CAPS_ADMIN_TOKEN` e `CAPS_ADMIN_TOKEN_USER`, tutte le
API possono essere invocate con privilegi amministrativi passando il token
nell'header HTTP `Authorization`:

```http
Authorization: Bearer <CAPS_ADMIN_TOKEN>
```

`CAPS_ADMIN_TOKEN_USER` deve essere lo username di un utente già presente nel
database. L'utente viene usato per attribuire operazioni, log e record creati;
i privilegi amministrativi sono applicati soltanto alla richiesta autenticata
dal token. Il token non viene accettato nella query string e deve essere usato
esclusivamente tramite HTTPS.

## Metodi disponibili

I Controller sono in `backend/src/Controller/Api/v1/` e i vari endpoint supportano i metodi HTTP GET, POST, PATCH e DELETE. 
Attualmente non tutti gli endpoint sono implementati. Alcuni esempi:
* `GET /proposals/?user_id=996&limit=10&offset=20` ritorna una versione paginata dei proposals. 
* `DELETE /proposals/1800` cancella il proposal con id=1800.
* `GET /forms` ritorna tutte le form nel sistema.
* `POST /forms` crea un nuovo form in base al payload JSON che viene passato (non implementato)
* `PATCH /forms/45` aggiorna una form in base al nuovo payload JSON che gli viene passato.

La maggior parte dei metodi `PUT` e `POST` non sono ancora stati implementati.

## JSON ritornato
I dati vengono ritornadi dentro un capo `data` del JSON restituito, che contiene anche i campi `code`, e `message`, che sono rispettivamente il codice HTTP (che viene restituito anche come codice HTTP dal metodo), ed un eventuale messaggio di successo e di errore. 

Esempi:
```
GET /proposals/?user=996&_limit=1

{
  "data": [
    {
      "id": 1846,
      "user_id": 996,
      "modified": "2022-02-24T08:41:46+00:00",
      "curriculum_id": 95,
      "state": "submitted",
      "submitted_date": "2022-02-24T08:41:46+00:00",
      "approved_date": null,
      "auths": [],
      "attachments": [],
      "curriculum": {
        [...]
      }
    }
  ],
  "code": 200,
  "message": "OK"
}
    
```

```
DELETE /api/v1/forms/23

{ 
  "data": null,
  "code": 200,
  "message": "OK"
}
```

```
GET /api/v1/proposals/1823

{
  "data": null,
  "code": 404,
  "message": "Proposal not found"
}
```

## Libraria Javascript

C'è una libreria minimal Javascript in `frontend/modules/api.js`, che si può usare per fare la richieste; tutti i metodi sono marcati come `async`. 
Se il response code non è 200 viene sollevato un errore di tipo RestError. Altrimenti viene restituito il campo `data` del response.
Se `data` è una array ci vengono attaccate le proprietà: `limit`, `offset` e `total`.
Ecco qualche esempio di utilizzo:

```javascript
import restClient from '../modules/api.js';

async function example() {
    try {
      const proposals = await restClient.get('/proposals', { '_limit': 10 });
      console.log(`caricati ${proposals.length} piani su ${proposals.total} disponibili`);
      
      await restClient.delete(`/proposals/${id}`);
    } catch(err) {
      console.log(`ERRORE: ${err.message} [${err.code}]`);
    }
}
```
