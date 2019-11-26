var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');

//GraphQL
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const events=[]


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())

//GraphQL

var schema = buildSchema(`
  type Event {
    _id : ID!
    title : String!
    description : String!
    price : Float!
    date : String!
  }
  input EventInput {
      title : String!
      description : String!
      price : Float!
      date : String!

  }
  
  type RootQuery { 
    events : [Event!]!

  }

  type RootMutation {
    createEvent(eventInput: EventInput):Event
  }
  schema {
    query:  RootQuery
    mutation :RootMutation
  }

`);

var root = {
  events:()=>{
    return [" Romatic Cooking","Sailing", " All-Night Coding"];
  },
  createEvent:(args)=>{
      const event ={
         _id: Math.random().toString()
      }
    }
}


app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));




app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
