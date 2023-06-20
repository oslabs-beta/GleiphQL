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

// add other code here:

const port = 8000
app.listen(port, () => {
  console.log(`Server now LiSteNiNg on http://localhost:${port}/graphql ~`)
});



// Code from Jiecheng
// const printedSchema = graphql.printSchema(schema);
// // console.log(printedSchema);
// const schemaAST = graphql.parse(printedSchema);
// //console.log('this is the parsedSchema:', schemaAST);
// let fields = 0;
// let types = 0;
// let lists = 0;

// graphql.visit(schemaAST, {
//   [graphql.Kind.OBJECT_TYPE_DEFINITION]: {
//     enter(node){
//       console.log('this is the current type:', node.name.value);
//       types++;
//     }
//   },
//   [graphql.Kind.FIELD_DEFINITION]: {
//     enter(node){
//       console.log('this is the node:', node);
//       console.log('this is the current field:', node.name.value);
//       if(node.type.kind === 'ListType') lists++;
//       fields++;
//     }
//   },
//   [graphql.Kind.LIST]: {
//     enter(node){
//       console.log('this is the current list:', node.name.value);
//     }
//   }
// });

// console.log('This is the number of fields:', fields);
// console.log('This is the number of types:', types);
// console.log('This is the number of lists:', lists);


