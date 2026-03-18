import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div class="toast" *ngFor="let t of toast.toasts()" [class]="'toast-' + t.type" (click)="toast.remove(t.id)">
        {{ t.message }}
      </div>
    </div>
  `,
})
export class ToastComponent {
  constructor(public toast: ToastService) {}
}
