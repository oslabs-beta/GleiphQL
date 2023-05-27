const express = require('express');
const graphql = require('graphql');
const fs = require('fs');
const path = require('path');
const { parse, print } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
// schema for locally created data (books/authors)
const schema = require('./schema/booksSchema');
// schema for star wars api
// const schema = require('./schema/starWarsSchema');

const app = express();

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));

// declare a file path to write the logs to
const filePath = path.join(__dirname, './logs', 'ast_logs.text');


// Code from Jiecheng
const printedSchema = graphql.printSchema(schema);
// console.log(printedSchema);
const schemaAST = graphql.parse(printedSchema);
// This console log as been moved to a separate file in the logs folder
//console.log('this is the parsedSchema:', schemaAST);
let fields = 0;
let types = 0;
let lists = 0;

// Testing the use of print()
// define a query (hardcode) to test
const query = `
  {
    film {
      title
      release_date
      characters {
        name
        species {
          name
        }
      }
    }
  }
`;

// // This parses the query into an object. To view, we can stringify it
// const ast = parse(query);
// console.log(`type: ${typeof ast}`);
// console.log(`this is ast: ${JSON.stringify(ast)}`)
// // This print method converts the ast information into a proper graphQL query
// const astString = print(ast);
// console.log(`this is astString: ${astString}`);

// write the log files to be saved. The logMessage will be the parsed information from the query
const logMessage = JSON.stringify(schemaAST);

fs.writeFile(filePath, logMessage, (error) => {
  if (error) {
    console.log(`Error writing logs to file: `, error);
  } else {
    console.log(`Logs saved to: `, filePath);
  }
});


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


const port = 8000
app.listen(port, () => {
  console.log(`Server now LiSteNiNg on http://localhost:${port}/graphql ~`)
});
