import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Principle, Task, PrincipleStats, PaginatedResponse } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class TrackerService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Principles ──────────────────────────────────────────
  getPrinciples(filters?: { search?: string; semester?: string; is_archived?: boolean }) {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.semester) params = params.set('semester', filters.semester);
    if (filters?.is_archived !== undefined) params = params.set('is_archived', String(filters.is_archived));
    return this.http.get<PaginatedResponse<Principle>>(`${this.base}/principles/`, { params });
  }

  getPrinciple(id: number) {
    return this.http.get<Principle>(`${this.base}/principles/${id}/`);
  }

  createPrinciple(data: Partial<Principle>) {
    return this.http.post<Principle>(`${this.base}/principles/`, data);
  }

  updatePrinciple(id: number, data: Partial<Principle>) {
    return this.http.patch<Principle>(`${this.base}/principles/${id}/`, data);
  }

  deletePrinciple(id: number) {
    return this.http.delete(`${this.base}/principles/${id}/`);
  }

  archivePrinciple(id: number) {
    return this.http.post<{ is_archived: boolean }>(`${this.base}/principles/${id}/archive/`, {});
  }

  getStats() {
    return this.http.get<PrincipleStats>(`${this.base}/principles/stats/`);
  }

  // ── Tasks ────────────────────────────────────────────────
  getTasks(filters?: { principle?: number; is_done?: boolean; priority?: string }) {
    let params = new HttpParams();
    if (filters?.principle) params = params.set('principle', String(filters.principle));
    if (filters?.is_done !== undefined) params = params.set('is_done', String(filters.is_done));
    if (filters?.priority) params = params.set('priority', filters.priority);
    return this.http.get<PaginatedResponse<Task>>(`${this.base}/tasks/`, { params });
  }

  createTask(data: Partial<Task>) {
    return this.http.post<Task>(`${this.base}/tasks/`, data);
  }

  updateTask(id: number, data: Partial<Task>) {
    return this.http.patch<Task>(`${this.base}/tasks/${id}/`, data);
  }

  deleteTask(id: number) {
    return this.http.delete(`${this.base}/tasks/${id}/`);
  }

  toggleTask(id: number) {
    return this.http.post<Task>(`${this.base}/tasks/${id}/toggle/`, {});
  }
}
