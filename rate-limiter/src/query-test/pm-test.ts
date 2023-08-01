import { 
  buildSchema, 
  parse, 
  TypeInfo
} from 'graphql';

const testSDL = `
directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
directive @paginationLimit(value: Int) on FIELD_DEFINITION
type Author {
  id: ID! @cost(value: 1)
  name: String @cost(value: 200) => typeInfo vs resolveInfo
  books: [Book] @cost(value: 3)
}
type Book {
  id: ID! @cost(value: 1)
  title: String @cost(value: 2)
  author: Author @cost(value: 3)
}
type Query {
  authors: [Author] @cost(value: 2)
  books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
}
      `
const testSDLPolymorphism = `
directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
directive @paginationLimit(value: Int) on FIELD_DEFINITION
type Author {
  id: ID! @cost(value: 1)
  name: String @cost(value: 200)
  books: [Book] @cost(value: 3)
}
type Book {
  id: ID! @cost(value: 1)
  title: String @cost(value: 2)
  author: Author @cost(value: 3)
}
union SearchResult = Author | Book
type Query {
  authors: [Author] @cost(value: 2)
  books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
  search(term: String): [SearchResult] @paginationLimit(value: 10)
}
`
const testQueryPolymorphism = `
query SearchQuery {
  search(term: "example") {
    ... on Author {
      id
      name
    }
    ... on Book {
      id
      title
    }
  }
}
`
const testQuery = `
query {
  books(limit: 4) {
    id
    title
    author {
      name
    }
  }
}
`
const testQueryFrag = `
query {
  ...BookFields
}
fragment BookFields on Query {
  books(limit: 4) {
    id
    title
    author {
      name
    }
  }
}
`
const builtSchema = buildSchema(testSDLPolymorphism)
const parsedAst = parse(testQueryPolymorphism);
const schemaType = new TypeInfo(builtSchema);
const pmTEST = {
  builtSchema,
  schemaType
}
export default pmTEST