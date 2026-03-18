import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthTokens, User } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly ACCESS_KEY = 'ut_access';
  private readonly REFRESH_KEY = 'ut_refresh';
  private readonly USER_KEY = 'ut_user';

  private _user = signal<User | null>(this.loadUser());
  user = this._user.asReadonly();
  isLoggedIn = computed(() => !!this._user());

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): User | null {
    try { return JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'); }
    catch { return null; }
  }

  login(email: string, password: string) {
    return this.http.post<AuthTokens>(`${environment.apiUrl}/auth/login/`, { email, password }).pipe(
      tap(res => {
        localStorage.setItem(this.ACCESS_KEY, res.access);
        localStorage.setItem(this.REFRESH_KEY, res.refresh);
        localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
        this._user.set(res.user);
      })
    );
  }

  register(data: { email: string; password: string; password2: string; full_name: string; university: string }) {
    return this.http.post(`${environment.apiUrl}/auth/register/`, data);
  }

  logout() {
    localStorage.removeItem(this.ACCESS_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/auth/login']);
  }

  refreshToken() {
    const refresh = localStorage.getItem(this.REFRESH_KEY);
    return this.http.post<{ access: string }>(`${environment.apiUrl}/auth/token/refresh/`, { refresh }).pipe(
      tap(res => localStorage.setItem(this.ACCESS_KEY, res.access))
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_KEY);
  }

  updateProfile(data: Partial<User>) {
    return this.http.patch<User>(`${environment.apiUrl}/auth/profile/`, data).pipe(
      tap(user => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._user.set(user);
      })
    );
  }

  changePassword(data: { old_password: string; new_password: string; new_password2: string }) {
    return this.http.post(`${environment.apiUrl}/auth/change-password/`, data);
  }
}
