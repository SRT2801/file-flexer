import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ConversionRequest {
  Parameters: Array<{
    Name: string;
    FileValue?: {
      Name: string;
      Data: string;
    };
    Value?: any;
  }>;
}

export interface ConversionResponse {
  ConversionCost: number;
  Files: Array<{
    FileName: string;
    FileExt: string;
    FileSize: number;
    FileData?: string;
    Url?: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class Convert {
  constructor(private http: HttpClient) {}

  private getConversionUrl(fromFormat: string, toFormat: string): string {
    return `https://v2.convertapi.com/convert/${fromFormat}/to/${toFormat}`;
  }

  convertFile(
    fromFormat: string,
    toFormat: string,
    file: File,
    token: string
  ): Observable<ConversionResponse> {
    const url = this.getConversionUrl(fromFormat, toFormat);

    return new Observable((observer) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];

        const body: ConversionRequest = {
          Parameters: [
            {
              Name: 'File',
              FileValue: {
                Name: file.name,
                Data: base64Data,
              },
            },
            {
              Name: 'StoreFile',
              Value: true,
            },
          ],
        };

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        this.http.post<ConversionResponse>(url, body, { headers }).subscribe({
          next: (response) => observer.next(response),
          error: (error) => observer.error(error),
          complete: () => observer.complete(),
        });
      };

      reader.onerror = () => {
        observer.error(new Error('Error al leer el archivo'));
      };

      reader.readAsDataURL(file);
    });
  }
}
