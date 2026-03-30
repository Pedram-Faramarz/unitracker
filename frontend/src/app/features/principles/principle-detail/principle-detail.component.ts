import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../../core/services/tracker.service';
import { ToastService } from '../../../core/services/toast.service';
import { Principle, Task } from '../../../shared/models';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-principle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  templateUrl: './principle-detail.component.html',
})
export class PrincipleDetailComponent implements OnInit {
  @Input() id!: string;

  principle = signal<Principle | null>(null);
  loading = signal(true);
  saving = signal(false);  // FIX: track saving state to prevent double submits
  newTaskText = '';
  newTaskPriority = 'medium';
  newTaskDueDate = '';
  editingTaskId = signal<number | null>(null);
  editingTaskText = '';
  filterDone: boolean | null = null;
  priorities = ['low', 'medium', 'high'];
  search = '';
  constructor(private tracker: TrackerService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.tracker.getPrinciple(+this.id).subscribe({
      next: p => { this.principle.set(p); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load principle.'); },
    });
  }

  get filteredTasks(): Task[] {
  const tasks = this.principle()?.tasks || [];
  const byDone = this.filterDone === null ? tasks : tasks.filter(t => t.is_done === this.filterDone);
  const q = this.search.trim().toLowerCase();
  return q ? byDone.filter(t => t.text.toLowerCase().includes(q)) : byDone;
}


  get pendingCount(): number {
    return (this.principle()?.tasks || []).filter(t => !t.is_done).length;
  }

  get doneCount(): number {
    return (this.principle()?.tasks || []).filter(t => t.is_done).length;
  }

  addTask() {
    const text = this.newTaskText.trim();
    // FIX: guard against empty text and double submit
    if (!text || !this.principle() || this.saving()) return;
    this.saving.set(true);
    const payload: any = {
      principle: this.principle()!.id,
      text,
      priority: this.newTaskPriority,
    };
    if (this.newTaskDueDate) payload.due_date = this.newTaskDueDate;

    this.tracker.createTask(payload).subscribe({
      next: () => {
        this.newTaskText = '';
        this.newTaskDueDate = '';
        this.saving.set(false);
        this.load();
        this.toast.success('Task added!');
      },
      error: (err) => {
        this.saving.set(false);
        const msg = Object.values(err?.error || {}).flat().join(' ') || 'Failed to add task.';
        this.toast.error(String(msg));
      },
    });
  }

  toggle(task: Task) {
    this.tracker.toggleTask(task.id).subscribe({
      next: () => this.load(),
      error: () => this.toast.error('Failed to update task.'),
    });
  }

  startEdit(task: Task) {
    this.editingTaskId.set(task.id);
    this.editingTaskText = task.text;
  }

  saveEdit(task: Task) {
    const text = this.editingTaskText.trim();
    if (!text) { this.cancelEdit(); return; }
    // FIX: don't save if text unchanged
    if (text === task.text) { this.cancelEdit(); return; }
    this.tracker.updateTask(task.id, { text }).subscribe({
      next: () => { this.cancelEdit(); this.load(); this.toast.success('Task updated.'); },
      error: () => this.toast.error('Failed to update task.'),
    });
  }

  cancelEdit() {
    this.editingTaskId.set(null);
    this.editingTaskText = '';
  }

  updatePriority(task: Task, priority: string) {
    if (task.priority === priority) return; // FIX: skip if unchanged
    this.tracker.updateTask(task.id, { priority: priority as any }).subscribe({
      next: () => this.load(),
      error: () => this.toast.error('Failed to update priority.'),
    });
  }

  deleteTask(task: Task) {
    if (!confirm(`Delete "${task.text}"?`)) return;
    this.tracker.deleteTask(task.id).subscribe({
      next: () => { this.toast.success('Task deleted.'); this.load(); },
      error: () => this.toast.error('Failed to delete task.'),
    });
  }

  getProgressColor(pct: number): string {
    if (pct === 100) return '#5af5c8';
    if (pct >= 50) return '#c8f55a';
    return '#f5a35a';
  }

  priorityClass(p: string): string {
    return ({ low: 'priority-low', medium: 'priority-med', high: 'priority-high' } as any)[p] || '';
  }

}
