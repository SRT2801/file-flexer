import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ConversionCardComponent,
  ConversionOption,
} from '../../components/conversion-card/conversion-card.component';
import {
  ConversionDialogComponent,
  ConversionDialogData,
} from '../../components/conversion-dialog/conversion-dialog.component';
import { Convert } from '../../services/convert';
import { environment } from '../../../environments/environments';
import { CONVERSION_OPTIONS } from '../../services/conversion-options';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ConversionCardComponent, ConversionDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  allConversions = CONVERSION_OPTIONS;

  selectedConversion = signal<ConversionOption | null>(null);

  errorMessage = signal<string>('');
  isConverting = signal(false);

  dialogVisible = signal(false);
  dialogData = signal<ConversionDialogData | null>(null);

  constructor(private convertService: Convert) {}

  onConversionSelected(option: ConversionOption): void {
    this.selectedConversion.set(option);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = `.${option.fromFormat}`;
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        this.convertFile(file, option);
      }
    };
    input.click();
  }

  convertFile(file: File, conversion: ConversionOption): void {
    this.isConverting.set(true);
    this.errorMessage.set('');

    this.dialogData.set({
      fileName: file.name,
      fromFormat: conversion.fromFormat,
      toFormat: conversion.toFormat,
      status: 'uploading',
      progress: 30,
    });
    this.dialogVisible.set(true);

    setTimeout(() => {
      if (this.dialogData()) {
        this.dialogData.set({
          ...this.dialogData()!,
          status: 'converting',
          progress: 70,
        });
      }
    }, 500);

    this.convertService
      .convertFile(conversion.fromFormat, conversion.toFormat, file, environment.token)
      .subscribe({
        next: (response) => {
          console.log('Conversión exitosa:', response);

          if (response.Files && response.Files.length > 0) {
            const convertedFile = response.Files[0];
            this.dialogData.set({
              fileName: file.name,
              fromFormat: conversion.fromFormat,
              toFormat: conversion.toFormat,
              status: 'completed',
              progress: 100,
              downloadUrl: convertedFile.Url,
            });

            this.errorMessage.set('¡Conversión completada!');
            setTimeout(() => this.errorMessage.set(''), 3000);
          }
          this.isConverting.set(false);
        },
        error: (error) => {
          console.error('Error:', error);

          this.dialogData.set({
            fileName: file.name,
            fromFormat: conversion.fromFormat,
            toFormat: conversion.toFormat,
            status: 'error',
            progress: 0,
            errorMessage: error?.message || 'Error al convertir el archivo',
          });

          this.errorMessage.set('Error al convertir el archivo');
          this.isConverting.set(false);
        },
      });
  }

  onDialogDownload(url: string): void {
    window.open(url, '_blank');
  }

  onDialogClose(): void {
    this.dialogVisible.set(false);
    this.dialogData.set(null);
  }
}
