import { SystemSettings, CategoryItem, Product, Customer, Sale, AppUser } from '../types';

export class ApiService {
  private settings: SystemSettings;

  constructor(settings: SystemSettings) {
    this.settings = settings;
  }

  private get headers() {
    return {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
  }

  private get authData() {
    return {
      dbHost: this.settings.mysql?.dbHost || '',
      dbName: this.settings.mysql?.dbName || '',
      dbUser: this.settings.mysql?.dbUser || '',
      dbPass: this.settings.mysql?.dbPass || '',
    };
  }

  private get baseUrl() {
    return this.settings.mysql?.apiUrl || '';
  }

  async getAllData(): Promise<any> {
    if (!this.baseUrl) return null;
    try {
      const params = new URLSearchParams();
      const auth = this.authData;
      Object.entries(auth).forEach(([key, val]) => params.append(key, val));

      const response = await fetch(`${this.baseUrl}?action=get_data`, {
        method: 'POST',
        headers: this.headers,
        body: params.toString()
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      const isFailedToFetch = error instanceof Error && error.message.includes('Failed to fetch');
      return { 
        error: true, 
        message: isFailedToFetch 
          ? 'Failed to fetch. Your hosting provider (e.g. InfinityFree) is likely blocking API requests with a security challenge. You may need a premium host or a host that allows external API cross-origin requests.' 
          : (error instanceof Error ? error.message : 'Failed to connect to database') 
      };
    }
  }

  async syncRecord(type: 'product' | 'category' | 'customer' | 'sale' | 'user', data: any): Promise<any> {
    if (!this.baseUrl) return { error: true, message: 'API URL not configured' };
    try {
      const params = new URLSearchParams();
      const auth = this.authData;
      Object.entries(auth).forEach(([key, val]) => params.append(key, val));
      params.append('type', type);
      params.append('data', JSON.stringify(data));

      const response = await fetch(`${this.baseUrl}?action=sync`, {
        method: 'POST',
        headers: this.headers,
        body: params.toString()
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      let res;
      try {
        const text = await response.text();
        res = JSON.parse(text);
      } catch (parseError) {
        alert('Database Sync Error: Server returned invalid response (possibly a PHP Error). Check server logs or try again.');
        throw new Error('Invalid JSON');
      }

      if (res && res.error) {
        console.error('API Error:', res.message);
        alert(`Database Sync Error: ${res.message}`);
      }
      return res;
    } catch (error) {
      console.error('Sync error:', error);
      const isFailedToFetch = error instanceof Error && error.message.includes('Failed to fetch');
      return { 
        error: true, 
        message: isFailedToFetch 
          ? 'Failed to fetch. Your hosting provider is blocking the API request.' 
          : (error instanceof Error ? error.message : 'Connection failed') 
      };
    }
  }

  async deleteRecord(type: 'product' | 'category' | 'customer' | 'user', id: string): Promise<any> {
    if (!this.baseUrl) return { error: true, message: 'API URL not configured' };
    try {
      const params = new URLSearchParams();
      const auth = this.authData;
      Object.entries(auth).forEach(([key, val]) => params.append(key, val));
      params.append('type', type);
      params.append('id', id);

      const response = await fetch(`${this.baseUrl}?action=delete`, {
        method: 'POST',
        headers: this.headers,
        body: params.toString()
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      let res;
      try {
        const text = await response.text();
        res = JSON.parse(text);
      } catch (parseError) {
        alert('Database Sync Error: Server returned invalid response (possibly a PHP Error). Check server logs or try again.');
        throw new Error('Invalid JSON');
      }

      if (res && res.error) {
        console.error('API Error:', res.message);
        alert(`Database Delete Error: ${res.message}`);
      }
      return res;
    } catch (error) {
      console.error('Delete error:', error);
      const isFailedToFetch = error instanceof Error && error.message.includes('Failed to fetch');
      return { 
        error: true, 
        message: isFailedToFetch 
          ? 'Failed to fetch. Your hosting provider is blocking the API request.' 
          : (error instanceof Error ? error.message : 'Connection failed') 
      };
    }
  }
}
