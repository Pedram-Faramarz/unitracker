import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../core/services/tracker.service';
import { ToastService } from '../../core/services/toast.service';
import { Principle } from '../../shared/models';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { PrincipleModalComponent } from './principle-modal/principle-modal.component';

@Component({
  selector: 'app-principles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent, PrincipleModalComponent],
  templateUrl: './principles.component.html',
})
export class PrinciplesComponent implements OnInit {
  principles = signal<Principle[]>([]);
  loading = signal(true);
  showModal = signal(false);
  editingPrinciple = signal<Principle | null>(null);
  search = '';
  filterArchived = false;
  // FIX: track sort option
  sortBy = '-created_at';

  constructor(private tracker: TrackerService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.tracker.getPrinciples({
      search: this.search || undefined,
      is_archived: this.filterArchived || undefined,
    }).subscribe({
      next: res => { this.principles.set(res.results); this.loading.set(false); },
      error: () => { this.loading.set(false); this.toast.error('Failed to load principles.'); },
    });
  }

  openCreate() { this.editingPrinciple.set(null); this.showModal.set(true); }
  openEdit(p: Principle, e: Event) {
    e.stopPropagation(); // FIX: prevent card click navigating while editing
    e.preventDefault();
    this.editingPrinciple.set(p);
    this.showModal.set(true);
  }

  onSaved() { this.showModal.set(false); this.load(); this.toast.success('Principle saved!'); }
  onCancelled() { this.showModal.set(false); }

  delete(p: Principle, e: Event) {
    e.stopPropagation();
    e.preventDefault();
    if (!confirm(`Delete "${p.name}" and all its tasks?`)) return;
    this.tracker.deletePrinciple(p.id).subscribe({
      next: () => { this.toast.success('Principle deleted.'); this.load(); },
      error: () => this.toast.error('Could not delete.'),
    });
  }

  archive(p: Principle, e: Event) {
    e.stopPropagation();
    e.preventDefault();
    this.tracker.archivePrinciple(p.id).subscribe({
      next: (res) => {
        this.toast.info(res.is_archived ? 'Archived.' : 'Unarchived.');
        this.load();
      },
      error: () => this.toast.error('Could not archive.'),
    });
  }

  getProgressColor(pct: number): string {
    if (pct === 100) return '#5af5c8';
    if (pct >= 50) return '#c8f55a';
    return '#f5a35a';
  }
}
