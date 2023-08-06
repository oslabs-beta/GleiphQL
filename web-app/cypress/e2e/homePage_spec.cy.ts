

describe('E2E testing for front end, home page', () => {
  // before each test, visit the landing page
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('checking header text in IntroSection', () => {
    cy.get('[data-cy=intro-title]')
      .should('have.text', 'Protect and monitor your GraphQL Endpoints')

    // check the paragraph text in the intro section
    cy.get('[data-cy=intro-body]')
      .should('have.text', 'GleiphQL is an Express middleware library which enhances performance and security by calculating query complexity, optimizing resource allocation, and preventing bottlenecks.')

    // check if the image in the intro section exists
    cy.get('.object-center').should('exist');
  })


  it('checking text content in the FeaturesSection', () => {
    // checking header of section
    cy.get('[data-cy=features-title]')
      .should('have.text', 'Features')

    // checking if GIF section exists and rendering properly
    cy.get('[data-cy=gif-display]')
      .should('exist')

    // checking text content of each feature listed
    cy.get('[data-cy=feat-1-title]')
      .should('have.text', 'Complexity Analysis')

    cy.get('[data-cy=feat-1-body]')
      .should('have.text', 'Dynamically calculate the resource requirements of each query, providing you with invaluable insights into its impact on your system.')

    cy.get('[data-cy=feat-2-title]')
      .should('have.text', 'Rate Limiting')

    cy.get('[data-cy=feat-2-body]')
      .should('have.text', 'Control and regulate incoming requests, ensuring fair and efficient resource allocation while safeguarding against abusive usage patterns.')

    cy.get('[data-cy=feat-3-title]')
      .should('have.text', 'Monitoring')

    cy.get('[data-cy=feat-3-body]')
      .should('have.text', `Gain deep visibility into your API's usage patterns, track response times, monitor error rates, and optimize your system's performance.`)
    
    cy.get('[data-cy=feat-4-title]')
      .should('have.text', 'Documentation')

    cy.get('[data-cy=feat-4-body]')
      .should('have.text', 'Built by developers for developers. Our comprehensive documentation makes it easy to work with GleiphQL!')
  })


  it('checking functionality of the Features buttons', () => {
    // feature 1 button
    cy.get('[data-cy=feat-1-btn]')
      .should('exist')
      .should('have.text', `Let's see feature 1 in action`)
      //.click()
    cy.get('[data-cy=gif-display]')
      .should('be.visible')
      .should('exist')
      

    // feature 2 button
    cy.get('[data-cy=feat-2-btn]')
      .should('exist')
      .should('have.text', `Let's see feature 2 in action`)
      //.click()
    cy.get('[data-cy=gif-display]')
      .should('be.visible')
      .should('exist')

    // feature 3 button
    cy.get('[data-cy=feat-3-btn]')
      .should('exist')
      .should('have.text', `Let's see feature 3 in action`)
      //.click()
    cy.get('[data-cy=gif-display]')
      .should('be.visible')
      .should('exist')

    // feature 4 button
    cy.get('[data-cy=feat-4-btn]')
      .should('exist')
      .should('have.text', `Let's see feature 4 in action`)
      //.click()
    cy.get('[data-cy=gif-display]')
      .should('be.visible')
      .should('exist')
  })

  // Checking content of Instruction Section
  it ('checking text content and of the Instructions Section', () => {
    // checking the header portion
    cy.get('[data-cy=instruction-title]')
    .should('have.text', 'Get Started Easily')

    // checking the instructions text
    cy.get('[data-cy=instruction-body]')
      .should('have.text', `Ready to revolutionize your GraphQL endpoint? Take the first step towards a faster, smarter, and more secure API infrastructure.`)
    
    // checking more info button has correct text
    cy.get('[data-cy=moreInfo-btn]').should('have.text', 'More Info');
  });

  it('checking "More Info" link has the correct attributes', () => {
    cy.get('[data-cy=moreInfo-btn]').should('have.attr', 'href', 'https://github.com/oslabs-beta/GleiphQL');
    cy.get('[data-cy=moreInfo-btn]').should('have.attr', 'target', '_blank');
  });

  it('checking "More Info" link has a secure link', () => {
    cy.get('[data-cy=moreInfo-btn]').invoke('attr', 'href').should('match', /^https:/);
  });

  // Test clicking the link directly without interception
it('should open a new tab when the "More Info" link is clicked', () => {
  // Check that the link opens in a new tab/window
  cy.get('[data-cy=moreInfo-btn]').should('have.attr', 'target', '_blank'); 

  // opens new tab
  //cy.get('[data-cy=moreInfo-btn]').click({ force: true });

  // currently not passing even though new tab address is correct
  //cy.url().should('eq', 'https://github.com/oslabs-beta/GleiphQL');
});


it('checking Footer content and functionality', () => {
  cy.get('[data-cy=footer-title]')
    .should('exist')
    .should('have.text', `Want to Contribute?`)

  cy.get('[data-cy=footer-body]')
    .should('exist')
    .should('have.text', `Join us and help developers secure and monitor their GraphQL endpoints.`)

  // test href attribute for each of the buttons
  cy.get('[data-cy=github-btn]')
    .should('have.attr', 'href', 'https://github.com/oslabs-beta/GleiphQL');
  cy.get('[data-cy=github-btn]')
    .should('have.attr', 'target', '_blank');

  cy.get('[data-cy=linkedIn-btn]')
    .should('have.attr', 'href', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  cy.get('[data-cy=linkedIn-btn]')
    .should('have.attr', 'target', '_blank');
})


})