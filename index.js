const express = require('express');
const env = require('dotenv').config(); 
const app = express();
const port = 3000;

app.post('/', (req, res) => {

    //chiamata al db
  res.send('Risultato')
})

app.listen(port, () => {
    
    console.log(`Example app listening on port ${port}`);
});

app.post('/', (req, res) => {
  // Your code here
  res.send('Risultato');
});
