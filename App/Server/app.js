const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser')
const logger = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
//ENV
require('dotenv').config()

//GraphQL
const graphqlHTTP = require('express-graphql');
const { buildSchema } = require('graphql');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

//Models
const Event = require('./models/event');
const User = require('./models/user');

const app = express();


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
  createEvent: args => {
    let createdEvent;

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "5dddcfe11c7e0830b45a658d"
    });
    return event
      .save()
      .then(result => {
        createdEvent = { ...result._doc, _id: result._doc._id.toString() };
        return User.findById("5dddcfe11c7e0830b45a658d");
      })
      .then(user => {
        if (!user) {
          throw new Error("User not found.");
        }
        user.createdEvents.push(event);
        return user.save();
      })
      .then(result => {
        return createdEvent;
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  },
  createUser: args => {
    return User.findOne({ email: args.userInput.email })
      .then(user => {
        if (user) {
          throw new Error("User exists already.");
        }
        return bcrypt.hash(args.userInput.password, 12);
      })
      .then(hashedPassword => {
        const user = new User({
          email: args.userInput.email,
          password: hashedPassword
        });
        return user.save();
      })
      .then(result => {
        return { ...result._doc, password: null, _id: result.id };
      })
      .catch(err => {
        throw err;
      });
  }
};

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: rootValue,
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
