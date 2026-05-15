
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideZonelessChangeDetection, ErrorHandler } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './src/app.component';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './src/app.routes';
import { CustomErrorHandler } from './src/error.handler';

// Handle chunk loading errors by reloading the page
window.addEventListener('error', (e) => {
  const message = e.message || '';
  if (message.includes('Failed to fetch dynamically imported module') || 
      message.includes('Loading chunk') || 
      message.includes('error loading dynamically imported module')) {
    console.warn('Chunk load failed, reloading page...', e);
    window.location.reload();
  }
}, true);

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideAnimations(),
    provideRouter(routes, withHashLocation()),
    { provide: ErrorHandler, useClass: CustomErrorHandler }
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.