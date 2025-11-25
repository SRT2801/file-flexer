import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  ConversionCardComponent,
  ConversionOption,
} from '../../components/conversion-card/conversion-card.component';
import {
  ConversionDialogComponent,
  ConversionDialogData,
} from '../../components/conversion-dialog/conversion-dialog.component';
import { InfoModalComponent, ModalContent } from '../../components/info-modal/info-modal.component';
import { Convert } from '../../services/convert';
import { environment } from '../../../environments/environments';
import { CONVERSION_OPTIONS } from '../../services/conversion-options';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ConversionCardComponent, ConversionDialogComponent, InfoModalComponent],
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

  infoModalVisible = signal(false);
  infoModalContent = signal<ModalContent | null>(null);

  constructor(
    private convertService: Convert,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

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

  async onLogout(): Promise<void> {
    try {
      await this.supabaseService.signOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  openHelp(): void {
    this.infoModalContent.set({
      title: 'Centro de Ayuda y FAQ',
      sections: [
        {
          heading: '¿Cómo convertir archivos?',
          content: `
            <strong>1.</strong> Selecciona el tipo de conversión que necesitas<br>
            <strong>2.</strong> Haz clic en la tarjeta de conversión<br>
            <strong>3.</strong> Selecciona tu archivo desde tu dispositivo<br>
            <strong>4.</strong> Espera mientras procesamos tu archivo<br>
            <strong>5.</strong> Descarga el archivo convertido
          `,
        },
        {
          heading: '¿Qué formatos son compatibles?',
          content: `
            Admitimos una amplia gama de formatos de imagen, video, audio, documentos y compresión.
            Revisa las tarjetas de conversión disponibles en la página principal para ver todas las opciones.
          `,
        },
        {
          heading: '¿Es seguro?',
          content: `
            Sí, todos tus archivos se procesan de forma segura. No almacenamos tus archivos después de la conversión
            y todas las transferencias están cifradas.
          `,
        },
        {
          heading: '¿Hay límites de tamaño?',
          content: `
            Los archivos tienen un límite máximo según tu plan. Los usuarios gratuitos pueden convertir archivos
            de hasta 100MB. Contacta con nosotros para planes empresariales.
          `,
        },
        {
          heading: '¿Necesitas más ayuda?',
          content: `
            Contacta con nuestro equipo de soporte en <strong>support@fileflexer.com</strong> y te ayudaremos
            con cualquier problema o pregunta que tengas.
          `,
        },
      ],
    });
    this.infoModalVisible.set(true);
  }

  openTerms(): void {
    this.infoModalContent.set({
      title: 'Términos y Condiciones',
      sections: [
        {
          heading: '1. Aceptación de los Términos',
          content: `
            Al acceder y utilizar File Flexer, aceptas estar sujeto a estos términos y condiciones.
            Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio.
          `,
        },
        {
          heading: '2. Uso del Servicio',
          content: `
            File Flexer proporciona servicios de conversión de archivos. Te comprometes a utilizar el servicio
            únicamente para fines legales y de acuerdo con todas las leyes y regulaciones aplicables.
            No debes cargar contenido ilegal, malicioso o que infrinja derechos de terceros.
          `,
        },
        {
          heading: '3. Privacidad y Datos',
          content: `
            Respetamos tu privacidad. Los archivos que cargas se procesan temporalmente y se eliminan
            automáticamente después de la conversión. No compartimos tus datos con terceros sin tu consentimiento.
            Consulta nuestra Política de Privacidad para más información.
          `,
        },
        {
          heading: '4. Propiedad Intelectual',
          content: `
            Todos los derechos de propiedad intelectual del servicio File Flexer pertenecen a sus propietarios.
            Tú conservas todos los derechos sobre los archivos que cargas y conviertes.
          `,
        },
        {
          heading: '5. Limitación de Responsabilidad',
          content: `
            File Flexer se proporciona "tal cual" sin garantías de ningún tipo. No nos hacemos responsables
            de pérdidas de datos, daños o problemas derivados del uso del servicio. Utiliza el servicio
            bajo tu propio riesgo.
          `,
        },
        {
          heading: '6. Modificaciones',
          content: `
            Nos reservamos el derecho de modificar estos términos en cualquier momento.
            Los cambios entrarán en vigor inmediatamente después de su publicación.
          `,
        },
        {
          heading: '7. Contacto',
          content: `
            Para preguntas sobre estos términos, contacta con nosotros en <strong>legal@fileflexer.com</strong>
          `,
        },
      ],
    });
    this.infoModalVisible.set(true);
  }
}
