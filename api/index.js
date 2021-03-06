const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(session);

const { 
  MONGO_USER, 
  MONGO_PASSWORD, 
  MONGO_IP, 
  MONGO_PORT, 
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT } = require('./config/config');

const userRouter = require('./routes/user.routes')
const mealRouter = require('./routes/meal.routes')
const ingredientRouter = require('./routes/ingredient.routes')

const app = express();

const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
  .connect(mongoUrl)
  .then(() => console.log('succesfully connected to DB'))
  .catch((e) => {
    console.log(e);
    setTimeout(connectWithRetry, 5000);
  });
}

connectWithRetry();

let redisClient = redis.createClient("127.0.0.1:6379");

app.use(cors())
app.use(express.json())

app.enable("trust proxy");
app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: { 
      httpOnly: true, 
      secure: false, 
      maxAge: 30000 
    }
}))


app.get('/api', (req, res) => {
  res.send('<h1>SportEat API</h1>')
});

app.use('/api/users', userRouter)
app.use('/api/meals', mealRouter)
app.use('/api/ingredients', ingredientRouter)

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`))