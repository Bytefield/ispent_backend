const fs = require('fs');
const https = require('https');
const express = require('express');
const cors = require('cors');
const app = express();
const multer = require('multer')

app.use(cors());

// Getting variables from dotenv
require('dotenv').config();
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const AUTH = DB_USER + ':' + DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;

// Setting up mongoose
const mongoose = require('mongoose');
const mongoUrl = `mongodb+srv://${AUTH}@cluster0.aw1sncn.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`;

let db;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    db = mongoose.connection.db;
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

// const productSchema = new mongoose.Schema({
//   relative_id: {
//     mercadona: String
//   },
//   allergens: String,
//   brand: String,
//   description: String,
//   display_name: String,
//   ean: String,
//   ingredients: String,
//   thumbnails: String
// });

const productSchema = {}

const Product = mongoose.model('Product', productSchema);

app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).send(product);
  } catch (err) {
    console.error(err);
    res.status(400).send(err);
  }
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.send(products);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

/*
  Upload json file to db for massive update
*/

// Setting up multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint
app.post('/upload_products', upload.single('file'), async (req, res) => {
  const fileContents = req.file.buffer.toString();
  const json = JSON.parse(fileContents);
  try {
    const result = await db.collection('products').insertMany(json);
    console.log(`Inserted ${result.length} documents into collection`);
    res.status(200).send(`Inserted ${result.length} documents into collection`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error inserting data into database');
  }
});

const options = {
  key: fs.readFileSync('./certs/key.pem'),
  cert: fs.readFileSync('./certs/cert.pem'),
  passphrase: process.env.PEM_PASSWORD
};

https.createServer(options, app).listen(5000, () => {
  console.log('Server listening on port 5000');
});