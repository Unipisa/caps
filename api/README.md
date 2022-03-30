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
npm start
```

Alcune prove con le API si possono fare direttamente con curl (qui si usa jq per 
fare il pretty print del JSON):
```bash
$ curl -s -H 'Content-Type: application/json' \
    -X POST \
    -d '{ "name": "Analisi Numerica", "credits": 6, "sector": "MAT/08", "code": "AA112" }' \
    http://localhost:3000/exams | jq
{
  "code": 200,
  "message": "OK"
}
```
... e poi
```bash
$ curl -s -H 'Content-Type: application/json' -X GET http://localhost:3000/exams
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
