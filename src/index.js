// index.js
import 'dotenv/config';  // ✅ loads .env first, before any other imports

import connectDb from './db/index.js';
import app from './app.js';

connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("server is running at port: ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("MONGO db connection failed !!!", error);
  });








/*
import express from 'express'

const app = express()

;(async ()=> {
    try {
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error
        })

        app.listen(process.env.PORT, () => {
            console.log("server is running on port: ", process.env.PORT)
        })
    } catch (error) {
        console.log(error.message);
        throw error;
    }
})()
*/