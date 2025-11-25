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
      console.error('Error signing out:', error);
    }
  }

  openHelp(): void {
    this.infoModalContent.set({
      title: 'Help Center & FAQ',
      sections: [
        {
          heading: 'How to convert files?',
          content: `
            <strong>1.</strong> Select the conversion type you need<br>
            <strong>2.</strong> Click on the conversion card<br>
            <strong>3.</strong> Select your file from your device<br>
            <strong>4.</strong> Wait while we process your file<br>
            <strong>5.</strong> Download the converted file
          `,
        },
        {
          heading: 'What formats are supported?',
          content: `
            We support a wide range of image, video, audio, document, and compression formats.
            Check out the conversion cards available on the main page to see all options.
          `,
        },
        {
          heading: 'Is it secure?',
          content: `
            Yes, all your files are processed securely. We don't store your files after conversion
            and all transfers are encrypted.
          `,
        },
        {
          heading: 'Are there size limits?',
          content: `
            Files have a maximum limit depending on your plan. Free users can convert files
            up to 100MB. Contact us for enterprise plans.
          `,
        },
        {
          heading: 'Need more help?',
          content: `
            Contact our support team at <strong>support@fileflexer.com</strong> and we'll help you
            with any issues or questions you may have.
          `,
        },
      ],
    });
    this.infoModalVisible.set(true);
  }

  openTerms(): void {
    this.infoModalContent.set({
      title: 'Terms and Conditions',
      sections: [
        {
          heading: '1. Acceptance of Terms',
          content: `
            By accessing and using File Flexer, you agree to be bound by these terms and conditions.
            If you do not agree with any part of these terms, you should not use our service.
          `,
        },
        {
          heading: '2. Use of Service',
          content: `
            File Flexer provides file conversion services. You agree to use the service
            solely for legal purposes and in accordance with all applicable laws and regulations.
            You must not upload illegal, malicious content or content that infringes third-party rights.
          `,
        },
        {
          heading: '3. Privacy and Data',
          content: `
            We respect your privacy. Files you upload are processed temporarily and automatically deleted
            after conversion. We do not share your data with third parties without your consent.
            Please refer to our Privacy Policy for more information.
          `,
        },
        {
          heading: '4. Intellectual Property',
          content: `
            All intellectual property rights to the File Flexer service belong to its owners.
            You retain all rights to the files you upload and convert.
          `,
        },
        {
          heading: '5. Limitation of Liability',
          content: `
            File Flexer is provided "as is" without warranties of any kind. We are not responsible
            for data loss, damages, or issues arising from the use of the service. Use the service
            at your own risk.
          `,
        },
        {
          heading: '6. Modifications',
          content: `
            We reserve the right to modify these terms at any time.
            Changes will take effect immediately after publication.
          `,
        },
        {
          heading: '7. Contact',
          content: `
            For questions about these terms, contact us at <strong>legal@fileflexer.com</strong>
          `,
        },
      ],
    });
    this.infoModalVisible.set(true);
  }

  openAbout(): void {
    this.infoModalContent.set({
      title: 'About File Flexer',
      sections: [
        {
          heading: 'Our Mission',
          content: `
            At <strong>File Flexer</strong>, our mission is to simplify file conversion for everyone.
            We believe that converting files between formats should be fast, easy, and accessible, no matter
            where you are or what device you use.
          `,
        },
        {
          heading: 'Who We Are?',
          content: `
            We are a passionate team of developers and designers committed to creating innovative
            web tools. Founded in 2025, File Flexer was born from the need for a reliable, fast,
            and easy-to-use file conversion solution.
          `,
        },
        {
          heading: 'What We Offer',
          content: `
            <strong>• Fast Conversions:</strong> Ultra-fast processing of your files<br>
            <strong>• Multiple Formats:</strong> Support for images, videos, audio, documents, and more<br>
            <strong>• Security:</strong> Your files are automatically deleted after conversion<br>
            <strong>• No Installation:</strong> Everything works directly in your browser<br>
            <strong>• Free:</strong> Basic conversions at no cost
          `,
        },
        {
          heading: 'Our Technology',
          content: `
            We use the latest web technologies to provide a superior conversion experience.
            Our platform is built with Angular, optimized for performance, and
            designed with a focus on user privacy.
          `,
        },
        {
          heading: 'Privacy Commitment',
          content: `
            Your privacy is our priority. We don't store your files after conversion,
            we don't track your activity, and we don't share your data with third parties. All processes
            are performed securely and temporarily.
          `,
        },
        {
          heading: 'Contact Us',
          content: `
            Have questions, suggestions, or need support?<br>
            <strong>Email:</strong> contact@fileflexer.com<br>
            <strong>Support:</strong> support@fileflexer.com<br>
            <strong>Partnerships:</strong> business@fileflexer.com<br><br>
            We'd love to hear from you and we continue working to improve our service every day.
          `,
        },
      ],
    });
    this.infoModalVisible.set(true);
  }
}
