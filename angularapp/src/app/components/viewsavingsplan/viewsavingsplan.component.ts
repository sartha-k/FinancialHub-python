import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

import { SavingsPlan } from 'src/app/models/savingsplan.model';
import { SavingsplanService } from 'src/app/services/savingsplan.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-viewsavingsplan',
  templateUrl: './viewsavingsplan.component.html',
  styleUrls: ['./viewsavingsplan.component.css']
})
export class ViewsavingsplanComponent implements OnInit, OnDestroy {

  savingsPlans: SavingsPlan[] = [];
  filteredSavingsPlans: SavingsPlan[] = [];

  searchText: string = '';

  currentPage: number = 0;
  pageSize: number = 5;
  totalPages: number = 0;
  pages: number[] = [];

  displayDeletePopup: boolean = false;
  savingsplanToDeleteId: number | null = null;

  showDetails = false;
  selectedTitle = '';
  selectedText = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private savingsPlanService: SavingsplanService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAllSavingsPlans();

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term: string) => {
        this.currentPage = 0;

        if (term.trim() === '') {
          this.getAllSavingsPlans();
        } else {
          this.savingsPlanService.searchSavingsPlans(term, this.currentPage, this.pageSize).subscribe({
            next: (data) => {
              this.filteredSavingsPlans = data.content;
              this.totalPages = data.totalPages;
              this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
            },
            error: (error) => {
              console.error(error);
              this.notificationService.error('Search failed!');
            }
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToCreateSavingsPlan(): void {
    this.router.navigate(['/admin/savings-plans/create']);
  }

  getAllSavingsPlans(): void {
    this.savingsPlanService.getSavingsPlansPage(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.savingsPlans = data.content;
        this.filteredSavingsPlans = data.content;
        this.totalPages = data.totalPages;
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
      },
      error: (error) => {
        console.error(error);
        this.notificationService.error('Failed to load savings plans!');
      }
    });
  }

  searchSavingsPlan(): void {
    this.searchSubject.next(this.searchText);
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

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;

      if (this.searchText.trim()) {
        this.savingsPlanService.searchSavingsPlans(this.searchText, this.currentPage, this.pageSize).subscribe({
          next: (data) => {
            this.filteredSavingsPlans = data.content;
            this.totalPages = data.totalPages;
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          },
          error: (error) => {
            console.error(error);
            this.notificationService.error('Search failed!');
          }
        });
      } else {
        this.getAllSavingsPlans();
      }
    }
  }

  getSerialNumber(index: number): number {
    return this.currentPage * this.pageSize + index + 1;
  }

  editSavingsPlan(savingsPlanId: number): void {
    this.router.navigate(['/admin/savings-plans', savingsPlanId, 'edit']);
  }

  openDeleteConfirmation(savingsPlanId: number): void {
    this.savingsplanToDeleteId = savingsPlanId;
    this.displayDeletePopup = true;
  }

  cancelDelete(): void {
    this.displayDeletePopup = false;
    this.savingsplanToDeleteId = null;
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

  confirmDelete(): void {
    if (this.savingsplanToDeleteId === null) {
      return;
    }

    const savingsPlanId = this.savingsplanToDeleteId;

    this.displayDeletePopup = false;
    this.savingsplanToDeleteId = null;

    this.deleteSavingsPlan(savingsPlanId);
  }

  deleteSavingsPlan(savingsPlanId: number): void {
    this.savingsPlanService.deleteSavingsPlan(savingsPlanId).subscribe({
      next: () => {
        this.notificationService.success('Savings plan deleted successfully!');

        if (this.filteredSavingsPlans.length === 1 && this.currentPage > 0) {
          this.currentPage--;
        }

        this.getAllSavingsPlans();
      },
      error: (error) => {
        console.error(error);
        this.notificationService.error('Failed to delete savings plan!');
      }
    });
  }
}