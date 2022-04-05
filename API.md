# Documentazione delle API REST

Sono attualmente in sviluppo delle API REST per CAPS, che vengono usate 
da (buona parte) del codice Javascript e in particolare la parte di 
interfaccia utente sviluppata in React. 

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
GET /proposals/?user=996&limit=1

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
      const proposals = await restClient.get('/proposals', { 'limit': 10 });
      console.log(`caricati ${proposals.length} piani su ${proposals.total} disponibili`);
      
      await restClient.delete(`/proposals/${id}`);
    } catch(err) {
      console.log(`ERRORE: ${err.message} [${err.code}]`);
    }
}
```
