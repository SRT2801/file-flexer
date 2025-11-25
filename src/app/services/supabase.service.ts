import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environments';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase!: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private initialized = false;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    console.log('🔵 Inicializando SupabaseService...');
    console.log('🌐 Es navegador:', this.isBrowser);

    if (!this.isBrowser) {
      console.log('⏭️ Saltando inicialización en servidor (SSR)');
      return;
    }

    try {
      const enabled = (environment.supabase as any).enabled;
      console.log('🔍 Supabase enabled:', enabled);

      if (enabled === false) {
        console.warn('⚠️ Supabase está deshabilitado. Actívalo en environments.ts');
        return;
      }

      console.log('🔧 Creando cliente Supabase...');
      this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
          storage: typeof window !== 'undefined' ? window.localStorage : undefined,
          storageKey: 'file-flexer-auth',
          flowType: 'pkce',
        },
        global: {
          headers: {
            'x-client-info': 'file-flexer',
          },
        },
      });

      console.log('✅ Cliente Supabase creado');

      setTimeout(() => this.initSession(), 100);
    } catch (error) {
      console.error('❌ Error al crear cliente Supabase:', error);
    }
  }

  private initSession() {
    if (this.initialized || !this.supabase || !this.isBrowser) return;
    this.initialized = true;

    console.log('🔄 Inicializando sesión...');
    this.supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        console.log('📦 Sesión obtenida:', session ? 'Usuario activo' : 'Sin sesión');
        this.currentUser.next(session?.user ?? null);
      })
      .catch((error) => {
        console.error('❌ Error al obtener sesión:', error);
        this.currentUser.next(null);
      });

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔔 Cambio de autenticación:', event);
      this.currentUser.next(session?.user ?? null);
    });
  }

  get user$(): Observable<User | null> {
    return this.currentUser.asObservable();
  }

  get user(): User | null {
    return this.currentUser.value;
  }

  async signUp(email: string, password: string) {
    if (!this.isBrowser || !this.supabase) {
      return { data: null, error: { message: 'Supabase no está disponible' } as any };
    }
    return await this.supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    if (!this.isBrowser || !this.supabase) {
      return { data: null, error: { message: 'Supabase no está disponible' } as any };
    }
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    if (!this.isBrowser || !this.supabase) {
      return { error: null };
    }
    return await this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email);
  }

  get db() {
    return this.supabase;
  }

  async uploadFile(bucket: string, path: string, file: File) {
    return await this.supabase.storage.from(bucket).upload(path, file);
  }

  async downloadFile(bucket: string, path: string) {
    return await this.supabase.storage.from(bucket).download(path);
  }

  getPublicUrl(bucket: string, path: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(path);
  }
}
