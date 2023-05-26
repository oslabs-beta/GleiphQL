const express = require('express');
const { graphqlHTTP } = require('express-graphql');
// schema for locally created data (books/authors)
// const schema = require('./schema/booksSchema');
// schema for star wars api
const schema = require('./schema/starWarsSchema');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

const port = 8000
app.listen(port, () => {
  console.log(`Server now LiSteNiNg on http://localhost:${port}/graphql bb~`)
});