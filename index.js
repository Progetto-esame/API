const express = require('express');
const {MongoClient} = require('mongodb');
const {ObjectId} = require('mongodb');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const app = express();

//const cors = require('cors');

//app.use(cors());

dotenv.config();

const setHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
}

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use( (req, res, next) => {
  setHeaders(res);
  next();
});

const port = process.env.port;
const uri = process.env.STRING_CONNECTION ?? '';
const dbName = process.env.DB_NAME;
const collection = {
  auto: 'Auto',
  utenti: 'Utenti'
}

if (uri.length > 0) {
  app.get('/getAll', async (req, res) => { //ricerca senza parametri per ottenere tutti i dati
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      const result = await auto.find().toArray();

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(result);
    } finally {
      await client.close();
    }
  });

  app.get('/getFilter', async (req, res) => { //ricerca per parametri anche diversi da _id
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      const query = {};

      for (const key in req.query)
        query[key] =
          key == '_id'
            ? new ObjectId(req.query[key]?.toString()) ?? ''
            : req.query[key]; 

      const result = await auto.find(query).toArray();

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(result);
    } finally {
      await client.close();
    }
  });

  app.get('/check', async (req, res) => { //verifica se esiste un documento con i parametri passati (può servire per verificare se un utente esiste già)
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      const query = {};
      let result;

      if(req.query._id != '' && req.query._id != undefined) {
        for (const key in req.query)
          query[key] =
            key == '_id'
              ? new ObjectId(req.query[key]?.toString()) ?? ''
              : req.query[key];
  
        result = auto.findOne(query);
      }else{
        result = new Promise((resolve) => resolve(null));
      }
      res.setHeader('Access-Control-Allow-Origin', '*');

      res.send(await result != null);
    } finally {
      await client.close();
    }
  });

  app.post('/insertSingle', async (req, res) => { //inserimento di un singolo documento
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);
      
      auto.insertOne(req.body);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('ok');
    } finally {
      await client.close();
    }
  });

  app.post('/insertMultiple', async (req, res) => { //inserimento di più documenti (non ci serve)
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      auto.insertMany(req.body);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('ok');
    } finally {
      await client.close();
    }
  });

  app.post('/update', async (req, res) => { //aggiornamento di un documento
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      const id = new ObjectId(req.body._id ?? '');

      delete req.body._id;

      auto.updateOne({ _id: id }, { $set: req.body });

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('ok');
    } finally {
      await client.close();
    }
  });

  app.post('/delete', async (req, res) => { //eliminazione di un documento
    const client = new MongoClient(uri);

    try {
      const database = client.db(dbName);
      const auto = database.collection(collection.auto);

      const filter = req.body;

      if (req.body._id !== undefined) filter._id = new ObjectId(req.body._id);

      auto.deleteOne(filter);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('ok');
    } finally {
      await client.close();
    }
  });

  app.post('/login', (req, res) =>{
    console.log(req.body);
    res.send('👍')
  })

  app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at port ${port}`);
  });
}


