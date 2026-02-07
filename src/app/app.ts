import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalRequestFeedbackModalComponent } from './shared/ui/global-request-feedback-modal/global-request-feedback-modal';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GlobalRequestFeedbackModalComponent],
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('blipzo-admin');
}
