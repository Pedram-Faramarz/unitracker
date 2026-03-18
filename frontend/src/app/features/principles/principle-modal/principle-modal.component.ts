import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TrackerService } from '../../../core/services/tracker.service';
import { Principle } from '../../../shared/models';

const COLORS = ['#c8f55a','#5af5c8','#f5a35a','#f55a7a','#a35af5','#5ab4f5','#f5e55a','#5af57a','#f55af0','#ff8c42'];
const SEMESTERS = ['Semester 1','Semester 2','Semester 3','Semester 4',
                   'Semester 5','Semester 6','Semester 7','Semester 8'];

@Component({
  selector: 'app-principle-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './principle-modal.component.html',
})
export class PrincipleModalComponent implements OnInit {
  @Input() principle: Principle | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  loading = signal(false);
  colors = COLORS;
  semesters = SEMESTERS;
  selectedColor = signal(COLORS[0]);
  errorMsg = signal('');

  constructor(private fb: FormBuilder, private tracker: TrackerService) {}

  ngOnInit() {
    this.selectedColor.set(this.principle?.color || COLORS[0]);
    this.form = this.fb.group({
      name: [this.principle?.name || '', [Validators.required, Validators.minLength(1), Validators.maxLength(200)]],
      description: [this.principle?.description || '', Validators.maxLength(1000)],
      semester: [this.principle?.semester || ''],
    });
  }

  submit() {
    if (this.form.invalid || this.loading()) return;
    this.errorMsg.set('');
    this.loading.set(true);
    const data = { ...this.form.value, color: this.selectedColor() };

    const req = this.principle
      ? this.tracker.updatePrinciple(this.principle.id, data)
      : this.tracker.createPrinciple(data);

    req.subscribe({
      next: () => { this.loading.set(false); this.saved.emit(); },
      error: (err) => {
        this.loading.set(false);
        // FIX: show server validation errors in the modal
        const errors = Object.values(err?.error || {}).flat().join(' ');
        this.errorMsg.set(errors || 'Failed to save. Please try again.');
      },
    });
  }
}
