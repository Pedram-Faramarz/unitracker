import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastMessage[]>([]);
  toasts = this._toasts.asReadonly();
  private nextId = 0;

  show(message: string, type: ToastMessage['type'] = 'success', duration = 3000) {
    const id = ++this.nextId;
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this._toasts.update(t => t.filter(x => x.id !== id));
  }

  success(msg: string) { this.show(msg, 'success'); }
  error(msg: string) { this.show(msg, 'error'); }
  info(msg: string) { this.show(msg, 'info'); }
}
