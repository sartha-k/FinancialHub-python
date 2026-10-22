import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  ViewChild
} from '@angular/core';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css']
})
export class ErrorComponent implements AfterViewInit {

  @ViewChild('overlay', { static: true })
  overlay!: ElementRef<HTMLDivElement>;

  ngAfterViewInit(): void {
    this.updateMask(
      window.innerWidth / 2,
      window.innerHeight / 2
    );
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    this.updateMask(event.clientX, event.clientY);
  }

  private updateMask(x: number, y: number): void {
    const mask = `radial-gradient(
      circle 120px at ${x}px ${y}px,
      transparent 0,
      black 150px
    )`;

    this.overlay.nativeElement.style.maskImage = mask;
    (this.overlay.nativeElement.style as any).webkitMaskImage = mask;
  }
}