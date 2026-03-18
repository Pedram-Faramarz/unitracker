import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackerService } from '../../core/services/tracker.service';
import { AuthService } from '../../core/services/auth.service';
import { PrincipleStats, Principle } from '../../shared/models';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  stats = signal<PrincipleStats | null>(null);
  recent = signal<Principle[]>([]);
  loading = signal(true);

  constructor(
    public auth: AuthService,
    private tracker: TrackerService
  ) {}

  ngOnInit() {
    this.tracker.getStats().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.tracker.getPrinciples().subscribe({
      next: res => this.recent.set(res.results.slice(0, 4)),
    });
  }

  getProgressColor(pct: number): string {
    if (pct === 100) return '#5af5c8';
    if (pct >= 50) return '#c8f55a';
    return '#f5a35a';
  }
}
