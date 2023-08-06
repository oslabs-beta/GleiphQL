import { defineConfig } from "cypress";

export default defineConfig({
  projectId: '75c5by',
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
      }
  },
});
