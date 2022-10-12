# Prototipo di CAPS API

Questa cartella contiene un prototipo di API per CAPS usando Mongo + Express, che 
potrebbero (in prospettiva) sostituire CakePHP. 

Per provare il repository si può avviare un database mongo di prova con 
```
sudo docker-compose up
```
che poi è possibile interrogare direttamente con ```sudo docker-compose exec mongo mongosh```,
per eventualmente controllare se sono stati inseriti i dati. 

Poi, in un terminale separato:
```bash
npm update # una tantum
npm start
```
Se dà errore `TextEncoder is not defined` bisogna aggiornare `node`.

Per compilare e tenere aggiornato il codice javascript durante lo sviluppo:
```bash
cd frontend
npm run watch:dev
```

Ora la pagina web si dovrebbe vedere qui: http://localhost:3000/

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
# import dati da mysql

Devi avere una chiave SSH per entrare sul server CAPS.
Allora puoi dare il comando:
```bash
bash migrate-mysql.sh
```
# struttura dei dati

Possibili princìpi da seguire:

* dovrà essere possibile migrare automaticamente i dati vecchi nella nuova struttura
* https://www.scylladb.com/glossary/nosql-design-principles/
* https://www.mongodb.com/nosql-explained/data-modeling
