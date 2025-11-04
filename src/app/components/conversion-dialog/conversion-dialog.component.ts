import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { ProgressBar } from 'primeng/progressbar';
import { SharedModule } from 'primeng/api';

export interface ConversionDialogData {
  fileName: string;
  fromFormat: string;
  toFormat: string;
  status: 'uploading' | 'converting' | 'completed' | 'error';
  progress: number;
  downloadUrl?: string;
  errorMessage?: string;
}

@Component({
  selector: 'app-conversion-dialog',
  standalone: true,
  imports: [CommonModule, Dialog, Button, ProgressBar, SharedModule],
  templateUrl: './conversion-dialog.component.html',
  styleUrl: './conversion-dialog.component.css',
})
export class ConversionDialogComponent {
  @Input()
  set visible(value: boolean) {
    this._visible = value;
  }
  get visible(): boolean {
    return this._visible;
  }
  private _visible: boolean = false;

  @Input() data: ConversionDialogData | null = null;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() download = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();

  get dialogVisible(): boolean {
    return this._visible;
  }

  set dialogVisible(value: boolean) {
    this._visible = value;
    this.visibleChange.emit(value);
  }

  get dialogHeader(): string {
    if (!this.data) return 'Conversión de archivo';

    switch (this.data.status) {
      case 'uploading':
        return 'Subiendo archivo...';
      case 'converting':
        return 'Convirtiendo archivo...';
      case 'completed':
        return '¡Conversión completada!';
      case 'error':
        return 'Error en la conversión';
      default:
        return 'Conversión de archivo';
    }
  }

  get statusIcon(): string {
    if (!this.data) return 'pi pi-file';

    switch (this.data.status) {
      case 'uploading':
      case 'converting':
        return 'pi pi-spin pi-spinner';
      case 'completed':
        return 'pi pi-check-circle';
      case 'error':
        return 'pi pi-times-circle';
      default:
        return 'pi pi-file';
    }
  }

  get statusClass(): string {
    if (!this.data) return '';

    switch (this.data.status) {
      case 'uploading':
        return 'uploading';
      case 'converting':
        return 'converting';
      case 'completed':
        return 'completed';
      case 'error':
        return 'error';
      default:
        return '';
    }
  }

  onHide(): void {
    this.dialogVisible = false;
    this.close.emit();
  }

  onDownload(): void {
    if (this.data?.downloadUrl) {
      this.download.emit(this.data.downloadUrl);
    }
  }

  closeDialog(): void {
    this.dialogVisible = false;
  }
}
