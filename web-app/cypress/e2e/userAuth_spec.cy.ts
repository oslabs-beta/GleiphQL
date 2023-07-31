// helper function to check if test email exists and delete it
const deleteTestUser = () => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:3000/api/account/logout',
    body: {
      'email': 'testEmail1@gmail.com',
      'password': 'test1',
    },
  });
  
  cy.request({
    method: 'DELETE',
    url: 'http://localhost:3000/api/account/deleteUser',
    body: {
      'email': 'testEmail1@gmail.com',
      'password': 'test1',
    }
  });
}

describe(`Testing functionality of register component`, () => {
  // Navigate to the register component
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy=login-btn]').click()
    cy.get('[data-cy=toggle-register]').click()
  })

  it('Testing text content of the register component', () => {
    cy.get('.text-sky-900')
      .should('have.text', 'Almost there!')
    
    cy.get('p.text-center')
      .should('have.text', 'Create an account to enjoy Gleiph QL')

    cy.get('.w-full > .justify-center')
      .should('have.text', 'Already have an account? Login here!')
  })

  it('Successfully creating a new user', () => {
    // input test data to create user
    cy.get('[data-cy=register-username]').type(`testEmail1@gmail.com`)
    cy.get('[data-cy=register-password').type(`test1`)
    cy.get('[data-cy=register-confirm-password').type(`test1`)

    // click complete register
    cy.get('[data-cy=register-submit]').click()

    // successful register has a pop up
    cy.get('.Toastify__toast-container').should('be.visible')
    cy.get('#\\32  > .Toastify__toast-body').should('contain', 'Account successfully created!')
    
    cy.url().should('include', '/')
  })

  // delete test user after successful creation
  after(() => {
    deleteTestUser();
  })

  it('Failed creating a new user', () => {
    // input test data to create user
    cy.get('[data-cy=register-username]').type(`Testbot8`)
    cy.get('[data-cy=register-password').type(`888`)
    cy.get('[data-cy=register-confirm-password').type(`888`)

    // click complete register
    cy.get('[data-cy=register-submit]').click()

    // failed login has a pop up
    cy.get('.Toastify__toast-container')
      .should('be.visible')
      .contains('Could not create account. Try again.')

    cy.url().should('include', '/')
  })

  
})


describe ('Testing functionality of login component', () => {

  // Navigate to the login component
  beforeEach(() => {
    cy.visit('http://localhost:3000')
    cy.get('[data-cy=login-btn]').click()
  })

  it ('Testing text content of login component', () => {
    cy.get('.text-sky-900')
      .should('have.text', 'SIGN IN')

    cy.get('.w-full > .justify-center')
      .should('have.text', 'Not a member? Sign up here!')
  })

  it ('Testing successful login functionality', () => {
    // input test data to login
    cy.get('[data-cy=login-username]').type('Testbot7');
    cy.get('[data-cy=login-password]').type('777');

    // click the login button
    cy.get('[data-cy=login-submit]').click()

    // successful login has a pop up
    cy.get('.Toastify__toast-container')
      .should('be.visible')
      .contains('Login successful!')

    // redirects to dashboard
    cy.url().should('include', '/dashboard');
  })

  it ('Testing failed login functionality', () => {
    // input incorrect data to login
    cy.get('[data-cy=login-username]').type('failedTest@fail.org');
    cy.get('[data-cy=login-password').type('noSuchAccount');
    // submit
    cy.get('[data-cy=login-submit]').click()

    // failed pop up window
    cy.get('.Toastify__toast-container')
      .should('be.visible')
      .contains('Login unsuccessful. Try again.')
  });

});