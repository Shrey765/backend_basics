import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({limit: "4mb"}))
app.use(express.urlencoded({extended: true, limit: "4mb"}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import router from './routes/user.routes.js'

//router declaration
app.use('/api/v1/users', router)
app.use('/api/v1/status', (req, res) => {
    res.send("server is live at port ", process.env.PORT)
})

export default app;