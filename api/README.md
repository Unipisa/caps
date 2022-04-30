# Prototipo di CAPS API

Questa cartella contiene un prototipo di API per CAPS usando Mongo + Express, che 
potrebbero (in prospettiva) sostituire CakePHP. 

Per provare il repository si può avviare un database mongo di prova con 
```
sudo docker-compose up
```
che poi è possibile interrogare direttamente con ```sudo docker-compose exec mongo mongsh```,
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

ottieni l'indirizzo IP della macchina docker remota:
```bash
REMOTE_IP=$( ssh root@caps.dm.unipi.it docker inspect capsmatematica_caps-db_1 | grep IPAddress | tail -1 | cut -f4 -d\" )
```
apri un tunnel ssh (blocca il terminale):
```bash
ssh -L 3306:${REMOTE_IP}:3306 root@caps.dm.unipi.it cat
```

su un altro terminale 
ottieni la password del database:
```bash
export MYSQL_PASSWORD=$( ssh root@caps.dm.unipi.it "grep CAPS_DB_PASSWORD docker/caps-matematica/caps.env" | cut -f2 -d= )
```
e avvia lo script di importazione
```bash
node migrate-mysql.js
```

# struttura dei dati

Possibili princìpi da seguire:

* dovrà essere possibile migrare automaticamente i dati vecchi nella nuova struttura
* https://www.scylladb.com/glossary/nosql-design-principles/
* https://www.mongodb.com/nosql-explained/data-modeling
