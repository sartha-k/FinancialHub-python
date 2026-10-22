import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { SavingsplanService } from
  'src/app/services/savingsplan.service';

import { NotificationService } from
  'src/app/services/notification.service';

@Component({
  selector: 'app-userviewsavingsplan',
  standalone: false,
  templateUrl: './userviewsavingsplan.component.html',
  styleUrls: ['./userviewsavingsplan.component.css']
})
export class UserviewsavingsplanComponent implements OnInit, OnDestroy {

  savingsPlans: any[] = [];
  filteredPlans: any[] = [];

  searchText = '';
  isLoading = false;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  showDetails = false;
  selectedTitle = '';
  selectedText = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private savingsplanService: SavingsplanService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getSavingsPlans();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(term => {
      this.currentPage = 0;
      if (term.trim() === '') {
        this.getSavingsPlans();
      } else {
        this.savingsplanService.searchSavingsPlans(term, this.currentPage, this.pageSize).subscribe({
          next: (data) => {
            this.filteredPlans = data.content;
            this.totalPages = data.totalPages;
          },
          error: () => this.notificationService.error('Search failed!')
        });
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  getSavingsPlans(): void {
    this.isLoading = true;
    this.savingsplanService.getSavingsPlansPage(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.savingsPlans = data.content;
          this.filteredPlans = data.content;
          this.totalPages = data.totalPages;
          this.isLoading = false;
        }, 1500);
      },
      error: (error) => {
        console.error('Unable to load savings plans:', error);
        setTimeout(() => {
          this.savingsPlans = [];
          this.filteredPlans = [];
          this.isLoading = false;
          this.notificationService.error('Failed to load savings plans!');
        }, 1500);
      }
    });
  }

  searchPlans(): void {
    this.searchSubject.next(this.searchText);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      if (this.searchText.trim()) {
        this.savingsplanService.searchSavingsPlans(this.searchText, this.currentPage, this.pageSize).subscribe({
          next: (data) => {
            this.filteredPlans = data.content;
            this.totalPages = data.totalPages;
          },
          error: () => this.notificationService.error('Search failed!')
        });
      } else {
        this.getSavingsPlans();
      }
    }
  }

  getVisiblePages(): (number | null)[] {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    const pages: (number | null)[] = [0];
    if (cur > 3) pages.push(null);
    for (let i = Math.max(1, cur - 1); i <= Math.min(total - 2, cur + 1); i++) pages.push(i);
    if (cur < total - 4) pages.push(null);
    pages.push(total - 1);
    return pages;
  }

  applyPlan(planId: number): void {
    console.log('Selected Plan Id:', planId);
    this.router.navigate(['/user/savings-plans', planId, 'apply']);
  }

  openDetails(title: string, text: string): void {
    if (!text || !text.trim()) return;
    this.selectedTitle = title;
    this.selectedText = text;
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedTitle = '';
    this.selectedText = '';
  }
}