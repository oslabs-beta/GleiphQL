
const testSDL: string = `
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
`;

const interfaceTestQuery1: string = `
  query {
    search {
      ... on Author {
        id
        name
      }
      ... on Book {
        id
        name
      }
    }
  }
`;

const interfaceTestQuery2: string = `
  query {
    search {
      ... on Searchable {
        id
        name
      }
    }
  }
`;

const testSDLPolymorphism: string = `
  directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
  directive @paginationLimit(value: Int) on FIELD_DEFINITION
  interface Searchable {
    id: ID!
    name: String
  }
  type Author implements Searchable {
    id: ID! @cost(value: 1)
    name: String @cost(value: 200)
    books: [Book] @cost(value: 3)
  }
  type Book implements Searchable {
    id: ID! @cost(value: 1)
    name: String @cost(value: 2)
    author: Author @cost(value: 3)
  }
  union SearchResult = Author | Book
  type Query {
    authors: [Author] @cost(value: 2)
    books(limit: Int @cost(value:10)): [Book] @cost(value: 2) @paginationLimit(value: 5)
    search: [Searchable]
  }
`

//doesn't work, I assume the isInterface behavior might be overwriting isList, causing the mults to not be properly conserved

const testQueryPolymorphism3: string = `
  query {
    content {
      ... on Post {
        id
        title
        body
        tags
      }

      ... on Image {
      id
      title
      uri
      }
    }
  }
`;

const testQueryPolymorphism4: string = `
  fragment postFields on Post {
    id
    title
    body
    tags
    related {
      content {
        id
        title
      }
    }
  }
  fragment imageFields on Image {
    id
    title
    uri
    related {
      content {
        id
        title
      }
    }
  }

  query {
    content {
      ...postFields
      ...imageFields
    }
  }
`;

const testQueryPolymorphism: string = `
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
`;

const testQuery: string = `
  query {
    books(limit: 4) {
      id
      title
      author {
        name
      }
    }
  }
`;

const testQueryInlineFrag: string = `
  query {
    books(limit: 4) {
      id
      title
      author {
        ... on Author {
          name
        }
      }
    }
  }
`;

const testQueryFrag: string = `
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
`;

const testQueryPolymorphism8: string = `
  fragment contentFields on Content {
    id
    title
    ... on Post {
      body
      tags
    }
    ... on Image {
      uri
    }
    related {
      content {
        id
        title
      }
    }
  }
  query {
    content {
      ...contentFields
    }
  }
`;

const testQueryPolymorphism7: string = `
  query {
    unionContent {
      ... on Post {
        id
        title
        body
        tags
        related {
          content {
            id
            title
          }
        }
      }
      ... on Image {
        id
        title
        uri
        related {
          content {
            id
            title
          }
        }
      }
    }
  }
`;

const testQueryBasic: string = `
  query {
    posts {
      id
      title
    }
  }
`;

const testQueryNested: string =`
  query {
    posts {
      id
      title
      related {
        content {
          ... on Post {
            id
            title
          }
        }
      }
    }
  }
`;

const testQueryPolymorphism2: string = `
  query {
    content {
      id
      title
      related {
        content {
          id
        }
      }
    }
  }
`;

const testQuery7: string = `
  query {
    content {
      id
      title
      ... on Post {
        related {
          content {
            id
            title
          }
        }
      }
      ... on Image {
        uri
      }
    }
  }
`;

const testQueryPolymorphism6: string = `
  fragment postFields on Post {
    id
    title
    body
    tags
    related {
      content {
        ... on Post {
          id
          title
        }
        ... on Image {
          id
          title
        }
      }
    }
  }
  fragment imageFields on Image {
    id
    title
    uri
    related {
      content {
        ... on Post {
          id
          title
        }
        ... on Image {
          id
          title
        }
      }
    }
  }
  query {
    content {
      ...postFields
      ...imageFields
    }
  }
`;

const testSDLPolymorphism2: string = `
  directive @cost(value: Int) on FIELD_DEFINITION | ARGUMENT_DEFINITION
  directive @paginationLimit(value: Int) on FIELD_DEFINITION

  type Related {
    content: [Content!]!
  }

  interface Content {
    id: ID!
    title: String!
    related: Related
  }

  type Post implements Content {
    id: ID! @cost(value: 3)
    title: String! @cost(value: 4)
    body: String! @cost(value: 10)
    tags: [String!]! @cost(value: 5)
    related: Related
  }

  type Image implements Content {
    id: ID! @cost(value: 5)
    title: String! @cost(value: 6)
    uri: String! @cost(value: 2)
    related: Related
  }

  union UnionContent = Post | Image

  type Query {
    content: [Content] @paginationLimit(value: 10)
    posts: [Post] @cost(value: 3) @paginationLimit(value: 10)
    images: [Image] @cost(value: 5) @paginationLimit(value: 10)
    related: [Related] @paginationLimit(value: 10)
    unionContent: [UnionContent] @paginationLimit(value: 10)
  }
`;

const testQueryPolymorphism5: string = `
  query {
    posts {
      id
      title
      related {
        content {
          ... on Image {
            id
            title
            related {
              content {
                ... on Post {
                  id
                  title
                  related {
                    content {
                      ... on Post {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    images {
      id
      title
      related {
        content {
          ... on Post {
            id
            title
            related {
              content {
                ... on Post {
                  id
                  title
                  related {
                    content {
                      ... on Post {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const testQuery6: string = `
  query TestQuery1 {
    unionContent {
      ... on Post {
        id
        title
        related {
          content {
            id
            title
          }
        }
      }
      ... on Image {
        id
        title
        uri
      }
    }
  }
`;

const testQuery8: string = `
  query {
    unionContent {
      ... on Post {
        id
        title
      }
      ... on Image {
        id
        title
      }
    }
  }
`;

const testQuery9: string = `
  query {
    unionContent {
      ... on Post {
        id
        title
        related {
          content {
            id
            title
          }
        }
      }
      ... on Image {
        id
        title
        uri
      }
    }
  }
`;

const testQuery10: string = `
  query {
    posts {
      id
      title
      body
      tags
    }
  }
`;