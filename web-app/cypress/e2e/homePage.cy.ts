import loginGif from '../../TS_src/client/public/images/loginGif.gif';
import teamModalsGif from '../../TS_src/client/public/images/teamModalsGif.gif';
import dashboardGif from '../../TS_src/client/public/images/dashboardGif.gif';
import testingGif from '../../TS_src/client/public/images/mrBean-Testing.gif';



describe('E2E testing for front end, home page', () => {
  // before each test, visit the landing page
  beforeEach(() => {
    cy.visit('http://localhost:3000')
  })

  it('checking header text in IntroSection', () => {
    cy.get('.p-4 > .text-2xl')
      .should('have.text', 'Protect and monitor your GraphQL Endpoints')

    // check the paragraph text in the intro section
    cy.get('.p-4 > p')
      .should('have.text', 'GleiphQL is an Express middleware library which enhances performance and security by calculating query complexity, optimizing resource allocation, and preventing bottlenecks.')

    // check if the image in the intro section exists
    cy.get('.object-center').should('exist');
  })


  it('checking text content in the FeaturesSection', () => {
    // checking header of section
    cy.get('.featuresSection-bg > h2')
      .should('have.text', 'Features')

    // checking if GIF section exists and rendering properly
    cy.get('.relative > .w-full')
      .should('exist')

    // checking text content of each feature listed
    cy.get(':nth-child(1) > .mt-4 > .px-4 > .text-xl')
      .should('have.text', 'Complexity Analysis')

    cy.get(':nth-child(1) > .mt-4 > .px-4 > .mb-4')
      .should('have.text', 'Accurate complexity scores to resource intensive each server request maybe.')

    cy.get(':nth-child(1) > .min-w-0 > .px-4 > .text-xl')
      .should('have.text', 'Rate Limiting')

    cy.get(':nth-child(1) > .min-w-0 > .px-4 > .mb-4')
      .should('have.text', 'Ensure that your server side resources are protected from malicious queries.')

    cy.get(':nth-child(2) > .mt-4 > .px-4 > .text-xl')
      .should('have.text', 'Monitoring')

    cy.get(':nth-child(2) > .mt-4 > .px-4 > .mb-4')
      .should('have.text', 'Instant updates when testing your graph QL queries.')
    
    cy.get(':nth-child(2) > :nth-child(2) > .px-4 > .text-xl')
      .should('have.text', 'Documentation')

    cy.get(':nth-child(2) > :nth-child(2) > .px-4 > .mb-4')
      .should('have.text', 'Built by developers for developers. You will love how easy it is to work with Gleiph QL!')
  })


  it('checking functionality of the Features buttons', () => {
    // feature 1 button
    cy.get(':nth-child(1) > .mt-4 > .px-4 > .m-2')
      .should('exist')
      .should('have.text', `Let's see feature 1 in action`)
      .click()
    cy.get('.relative > .w-full')
      .should('be.visible')
      .should('exist')
      

    // feature 2 button
    cy.get(':nth-child(1) > .min-w-0 > .px-4 > .m-2')
      .should('exist')
      .should('have.text', `Let's see feature 2 in action`)
      .click()
    cy.get('.relative > .w-full')
      .should('be.visible')
      .should('exist')

    // feature 3 button
    cy.get(':nth-child(2) > .mt-4 > .px-4 > .m-2')
      .should('exist')
      .should('have.text', `Let's see feature 3 in action`)
      .click()
    cy.get('.relative > .w-full')
      .should('be.visible')
      .should('exist')

    // feature 4 button
    cy.get(':nth-child(2) > :nth-child(2) > .px-4 > .m-2')
      .should('exist')
      .should('have.text', `Let's see feature 4 in action`)
      .click()
    cy.get('.relative > .w-full')
      .should('be.visible')
      .should('exist')
  })

  // Checking content of Instruction Section
  it ('checking text content and functionality of the Instructions Section', () => {
    // checking the header portion
    cy.get('.p-8.text-center > div.md\\:w-1\\/2 > .text-2xl')
    .should('have.text', 'Get Started Easily')

    // checking the instructions text
    cy.get('.p-8.text-center > div.md\\:w-1\\/2 > p')
      .should('have.text', `Ready to revolutionize your GraphQL endpoint? Take the first step towards a faster, smarter, and more secure API infrastructure.`)

    // Checking the more info button opens in a new tab by checking its target attribute
    cy.get('#moreInfo-btn > .rounded-md')
      .parent() // Navigate to the parent <a> tag
      .should('have.attr', 'data-expected-url', 'https://github.com/oslabs-beta/GleiphQL')
      .should('have.attr', 'target', '_blank')

    // checking if the copy buttons are functional
    cy.get('#npmCopy-btn').click()
    // Read the test from the clipboard
    // cy.getClipboard().then(() => {
    //   // make assertion to check if the correct text has been copied to the clipboard

    // })
  });

})