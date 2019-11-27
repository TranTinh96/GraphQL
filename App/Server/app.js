var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var logger = require('morgan');
var mongoose = require('mongoose');

//ENV
require('dotenv').config()

//GraphQL
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//Models
const Event = require('./models/event');
const User = require('./models/user');

var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json())

//GraphQL

var schema = buildSchema(`
  type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }
  type User {
      _id: ID!
      email: String!
      password: String
    }



  input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }
  input UserInput {
      email: String!
      password: String!
    }



  type RootQuery {
      events: [Event!]!
    }

  type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

  schema {
      query: RootQuery
      mutation: RootMutation
    }
  `)

var rootValue = {
  events: () => {
    return Event.find()
      .then(events => {
        return events.map(event => {
          return { ...event._doc, _id: event.id };
        });
      })
      .catch(err => {
        throw err;
      });
  },
  createEvent: (args) => {
    const event = new Event ({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: + args.eventInput.price,
      date: new Date(args.eventInput.date)
    });
    return event
      .save()
      .then(result => {
          return { ...result._doc, _id: result._doc._id.toString() };
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }
}

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootValue,
  graphiql: true,
}));


app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(function(req, res, next) {
  next(createError(404));
});


app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

//Connect DATABASE
mongoose.connect(process.env.DATABASE_HOST,function(err,data){
  if(err)throw err;
  console.log("Database connect")
});

module.exports = app;
