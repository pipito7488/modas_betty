// lib/mongodbClient.js

import { MongoClient } from 'mongodb';

// Asegúrate de que la variable de entorno MONGODB_URI esté definida
const uri = process.env.MONGODB_URI;
const options = {
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10, // Límite de conexiones para evitar sobrecarga
};

let client;
let clientPromise;

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
  // En modo de desarrollo, usamos una variable global para preservar el valor
  // entre hot reloads.
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // En producción, es seguro crear una nueva conexión.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Exporta una Promesa del cliente que se puede resolver en cualquier lugar 
// del servidor (Server Components o Route Handlers)
export default clientPromise;