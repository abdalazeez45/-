import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorTrackingService } from './services/error-tracking.service';

@Injectable()
export class CustomErrorHandler implements ErrorHandler {
  private errorTrackingService: ErrorTrackingService | undefined;

  // Inject the Injector itself. This is a safe way to get dependencies
  // in a global error handler.
  constructor(private injector: Injector) {}

  handleError(error: unknown): void {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('Failed to fetch dynamically imported module') || 
        message.includes('Loading chunk')) {
      window.location.reload();
      return;
    }

    // Lazily retrieve the service only when an error occurs.
    // This avoids issues where the error handler is created before
    // the service is available.
    if (!this.errorTrackingService) {
      this.errorTrackingService = this.injector.get(ErrorTrackingService);
    }

    // Log the error to our external tracking service
    this.errorTrackingService.logError(error);

    // Also log the error to the console, which is the default behavior.
    console.error("Caught by CustomErrorHandler:", error);
  }
}
