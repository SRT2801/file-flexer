import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalContent {
  title: string;
  sections: {
    heading?: string;
    content: string;
  }[];
}

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.css',
})
export class InfoModalComponent {
  visible = input.required<boolean>();
  content = input.required<ModalContent | null>();

  visibleChange = output<boolean>();

  closeModal(): void {
    this.visibleChange.emit(false);
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }
}
