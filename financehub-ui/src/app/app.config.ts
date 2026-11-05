/**
 * app.config.ts
 *
 * This file wires up the core Angular providers for the whole application.
 * It tells Angular to use the router (for navigation), the HTTP client (for API calls),
 * and a global error listener. It is passed into bootstrapApplication in main.ts
 * so every part of the app has access to these shared services.
 */
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// Global Angular application configuration: router, HTTP client, and error listeners
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient()
  ]
};
