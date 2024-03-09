const {MongoClient} = require('mongodb');
const express = require('express');
const env = require('dotenv').config(); 
const app = express();
const port = 3000;

const client = new MongoClient(process.env.STRING_CONNECTION);



