const express = require('express');
const app = express();
const path = require('path');
const http = require('http')
const socketIo = require('socket.io')
const cors = require("cors");
const rateLimit = require('express-rate-limit');
require('dotenv').config()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')));
app.set('view engine', 'ejs')
const adminSeederScript = require('./utils/adminSeederScript')
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const connectDb = require('./config/mongoose');
const userRoute = require('./routes/userRoute')
const projectRoute = require('./routes/projectRoute')
const adminRoute = require('./routes/adminRoute')
const updateRoute = require('./routes/updateRoute');
const designRoute = require('./routes/designRoute')
const reportRoute = require('./routes/reportRoute')
const chatRoute = require('./routes/chatRoute')
const taskRoute = require('./routes/taskRoute')
const commentRoute = require('./routes/commentRoute')
const noteRoute = require('./routes/noteRoute')
const templateRoute = require('./routes/templateRoute')
const materialRoute = require('./routes/materialRoute')
const workerRoute = require('./routes/workerRoute')
const connectCloudinary = require('./config/cloudinary');
const emailCron = require('./cron/emailCron');
const connectSocket = require('./config/socketio');

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "https://gati-vidhi.vercel.app",
]

const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
    methods: ["GET", "POST"]
  }
})



connectDb();
adminSeederScript();
connectSocket(io);
connectCloudinary();
emailCron.start();


app.use(cors({
  origin: ALLOWED_ORIGINS,
  credentials: true
}));
app.use(cookieParser());

app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret : process.env.EXPRESSSESSION_SECRET_KEY,
    cookie: {
        sameSite: 'none',
        secure: true,
        httpOnly: true,
    }
}))



app.use('/user/login', loginLimiter)
app.use('/admin/login', loginLimiter)
app.use('/worker/login', loginLimiter)
app.use('/user',userRoute)
app.use('/project',projectRoute)
app.use('/admin', adminRoute)
app.use('/update', updateRoute)
app.use('/design', designRoute)
app.use('/report',reportRoute)
app.use('/chat', chatRoute)
app.use('/task', taskRoute)
app.use('/comment', commentRoute)
app.use('/note', noteRoute)
app.use('/template', templateRoute)
app.use('/material', materialRoute)
app.use('/worker', workerRoute)
app.get('/', (req,res)=>{
    res.send("Hello ")
})


server.listen(process.env.PORT)

