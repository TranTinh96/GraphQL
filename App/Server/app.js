const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config()

//GraphQL
const graphqlHTTP = require('express-graphql');
const graphQlSchema = require('./graphQL/Schema/index');
const graphQlResolvers = require('./graphQL/resolvers/index');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())

app.use('/graphql', graphqlHTTP({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true,
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);


//Connect DATABASE
mongoose.connect(process.env.DATABASE_HOST,function(err,data){
  if(err)throw err;
  console.log("Database connect")
});

module.exports = app;
