const express = require('express');
const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');
var crypto = require('crypto');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const { Console } = require('console');
const app = express();


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

app.use((req, res, next) => {
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

      if (req.query._id != '' && req.query._id != undefined) {
        for (const key in req.query)
          query[key] =
            key == '_id'
              ? new ObjectId(req.query[key]?.toString()) ?? ''
              : req.query[key];

        result = auto.findOne(query);
      } else {
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

  app.post('/login', async (req, res) => {

    const { email, password } = req.body;
    console.log(email);
    const client = new MongoClient(uri);
    try {
      const db = client.db(dbName);
      const users = db.collection('Utenti');
      const user = await users.findOne({ email: email });
      console.log(user);

      if (!user) {
        console.log(email, password);
        return res.status(401).send('Invalid email or password');
      }
      // Compare the provided password with the hashed password stored in the database

      const hashedPass = crypto.createHash("sha256").update(password).digest("hex");
      console.log("Hashed pass: " + hashedPass);
      console.log("User pass: " + user.password);

      if (hashedPass == user.password) {
        //req.session.user = user; --da fixare sessione
        res.status(200).json({ message: 'Allowed' });
      } else {
        return res.status(401).json('Invalid email or password');
      }
    } catch(e) {
      res.status(500).json('Internal server error');
    }
  });

  app.post('/register', (req, res) => {
    const { name, surname, email, password } = req.body;

    const client = new MongoClient(uri);
    
    try {
      const database = client.db(dbName);
      const utenti = database.collection(collection.utenti);
      const searchUser = utenti.findOne({ email: email });
      console.log(searchUser);
      if(!searchUser) {
      const hashedPass = crypto.createHash("sha256").update(password).digest("hex");

      const user = { name, surname, email, password: hashedPass };
      utenti.insertOne(user);

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('Utente registrato correttamente');
      }else{
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.send('Utente già registrato');
      }
    } catch {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send('Ops...Qualcosa è andato storto');
    }
  });

  app.listen(port, process.env.ip, () => {
    console.log(`⚡️[server]: Server is running at port ${port}, ip: ${process.env.ip}`);
  });

}