// express 모듈
const express = require('express');
const app = express();

// dotenv 모듈
const dotenv = require('dotenv');
dotenv.config();

app.listen(process.env.PORT);

const userRouter = require('./routes/users.js');
const likeRouter = require('./routes/likes.js');
const cartRouter = require('./routes/carts.js');
const orderRouter = require('./routes/orders.js');
const bookRouter = require('./routes/books.js');
const categoryRouter = require('./routes/category.js');

app.use("/users", userRouter);
app.use("/likes", likeRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
app.use("/books", bookRouter);
app.use("/category", categoryRouter);