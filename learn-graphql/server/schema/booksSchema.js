/* eslint-disable @typescript-eslint/no-var-requires */
// ** This approach worked with mock data that was created locally ** 
//This section had three goals: 1) Define schema, 2) Define relational data, 3) Define the root query
const graphql = require('graphql');
const _ = require('lodash');
const { makeExecutableSchema } = require('@graphql-tools/schema');

const { 
  GraphQLObjectType, 
  GraphQLString, 
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList 
} = graphql;

// mock data
const books = [
  { name: 'Name of the Wind', genre: 'Fantasy', id: '1', authorId: '1' },
  { name: 'The Final Empire', genre: 'Fantasy', id: '2', authorId: '2' },
  { name: 'The Long Earth', genre: 'Sci-Fi', id: '3', authorId: '3' },
  { name: 'The Hero of Ages', genre: 'Fantasy', id: '4', authorId: '2' },
  { name: 'The Colour of Magic', genre: 'Fantasy', id: '5', authorId: '3' },
  { name: 'The Light Fantastic', genre: 'Fantasy', id: '6', authorId: '3' },
];

const authors = [
  { name: 'Patrick Rothfuss', age: 44, id: '1' },
  { name: 'Brandon Sanderson', age: 42, id: '2' },
  { name: 'Terry Pratchett', age: 66, id: '3' } 
];


// // define type
// const AuthorType = new GraphQLObjectType({
//   name: 'Author',
//   // The main reason why we wrap these fields inside functions is so that when the page loads, all of the fields function definitions are already hoisted. When the proper query is called, then the query will be aware of which field and type to query through to get the right information. 
//   fields: () => ({
//     id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     age: { type: GraphQLInt },
//     books: {
//       type: new GraphQLList(BookType),
//       resolve(parent, args) {
//         console.log(`this is parent for AuthorType -> books: ${JSON.stringify(parent)}`);
//         return _.filter(books, { authorId: parent.id })
//       }
//     }
//   })
// });

// const BookType = new GraphQLObjectType({
//   name: 'Book',
//   fields: () => ({
//     id: { type: GraphQLID },
//     name: { type: GraphQLString },
//     genre: { type: GraphQLString },
//     author: {
//       type: AuthorType,
//       resolve(parent, args) {
//         console.log(`this is parent: ${JSON.stringify(parent)}`);
//         return _.find(authors, { id: parent.authorId });
//       }
//     }
//   })
// });



// define root query. Any fields or types defined in this Root Query allows us to create complex queries on the front end side, as long as we define the relational points of the data. 
// const RootQuery = new GraphQLObjectType({
//   name: 'RootQueryType',
//   fields: {
//     // will start to construct multiple fields
//     book: {
//       type: BookType,
//       args: { id: { type: GraphQLID } }, // this is representative of id: '123' argument
//       resolve(parent, args) {
//         // code to get data from db/ other source
//         console.log(`What is typeof for args.id: ${typeof(args.id)}`); // When we make a query on the front end, this should log "string" in the terminal
//         return _.find(books, {id: args.id });
//       }
//     },
//     // define author field
//     author: {
//       type: AuthorType,
//       args: { id: { type: GraphQLID } },
//       resolve(parent, args) {
//         return _.find(authors, { id: args.id });
//       }
//     },
//     // setting up a list of books to query
//     books: {
//       type: new GraphQLList(BookType),
//       resolve(parent, args) {
//         return books
//       }
//     },
//     authors: {
//       type: new GraphQLList(AuthorType),
//       resolve(parent, args) {
//         return authors
//       }
//     }
//   }
// });

/*
Example query:
book (id: '123') {  
  name
  genre
}
*/

// module.exports = new GraphQLSchema({
//   query: RootQuery
// });

const typeDefs = `
  type Author {
    id: Int!
    name: String
    age: Int
    books: [Book]
  }

  type Book {
    id: Int!
    name: String
    genre: String
    author: [Author]
  }
  
  type Query {
    book(id: ID!): Book
    author(id: ID!): Author
    books: [Book]
    authors: [Author]
  }
`;

const resolvers = {
  Query: {
    book: ({ id }) => books.find(book => book.id === id),
    author: ({ id }) => authors.find(author => author.id === id),
    books: (parent) => _.filter(books, { authorID: parent.id }),
    authors: (parent) => _.filter(authors, { bookId: parent.id })
  }
};

const testSchema = makeExecutableSchema({ typeDefs, resolvers });
module.exports = testSchema;
// this console logs the invocation of the resolver for book with the id of 1
console.log(`This is the testSchema`, testSchema.getQueryType().getFields().book.resolve({ id: '1' }));

// this log shows all the fields and their attributes within the schema
console.log(`This is the testSchema`, testSchema.getQueryType().getFields());




