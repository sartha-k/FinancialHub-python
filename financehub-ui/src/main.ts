/**
 * main.ts
 *
 * This is the entry point of the Angular application.
 * It starts the app by loading the root App component with the global configuration
 * defined in app.config.ts. The browser runs this file first when the page loads.
 * You rarely need to change this file unless you are changing how the app boots up.
 */
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Bootstraps the root App component with the global app configuration
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));