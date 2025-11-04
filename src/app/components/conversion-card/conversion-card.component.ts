import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConversionOption {
  id: string;
  title: string;
  description: string;
  fromFormat: string;
  toFormat: string;
  icon: string;
}

@Component({
  selector: 'app-conversion-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conversion-card.component.html',
  styleUrl: './conversion-card.component.css',
})
export class ConversionCardComponent {
  option = input.required<ConversionOption>();
  selected = input<boolean>(false);

  cardClicked = output<ConversionOption>();

  onClick(): void {
    this.cardClicked.emit(this.option());
  }
}
