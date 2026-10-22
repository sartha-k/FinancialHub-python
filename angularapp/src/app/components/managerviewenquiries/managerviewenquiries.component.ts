import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import { Subject } from 'rxjs';

import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import { Enquiry } from 'src/app/models/enquiry.model';
import { EnquiryService } from 'src/app/services/enquiry.service';

@Component({
  selector: 'app-managerviewenquiries',
  standalone: false,
  templateUrl: './managerviewenquiries.component.html',
  styleUrls: ['./managerviewenquiries.component.css']
})
export class ManagerviewenquiriesComponent
  implements OnInit, OnDestroy {

  enquiries: Enquiry[] = [];
  filteredEnquiries: Enquiry[] = [];
  pagedEnquiries: Enquiry[] = [];

  searchText = '';
  isLoading = false;
  errorMessage = '';
  selectedText = '';
  selectedTitle = '';
  showDetails = false;

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private enquiryService: EnquiryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEnquiries();
    this.initializeSearch();
  }

  private initializeSearch(): void {
    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((term: string) => {
        const searchTerm = term.trim();

        if (searchTerm === '') {
          this.filteredEnquiries = this.enquiries;
          this.currentPage = 0;
          this.updatePagination();
          return;
        }

        this.searchEnquiries(searchTerm);
      });
  }

  loadEnquiries(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.enquiryService
      .getAllEnquiry()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Enquiry[]) => {
          setTimeout(() => {
            this.enquiries = data;
            this.filteredEnquiries = data;
            this.currentPage = 0;
            this.updatePagination();
            this.isLoading = false;
          }, 1500);
        },

        error: (error) => {
          console.error(
            'Unable to load enquiries:',
            error
          );

          setTimeout(() => {
            this.errorMessage =
              typeof error.error === 'string' &&
              error.error.trim() !== ''
                ? error.error
                : error.error?.message ||
                  'Unable to load enquiries. Please try again.';

            this.enquiries = [];
            this.filteredEnquiries = [];
            this.pagedEnquiries = [];
            this.totalPages = 0;
            this.isLoading = false;
          }, 1500);
        }
      });
  }

  private searchEnquiries(searchTerm: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.enquiryService
      .searchAllEnquiries(searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Enquiry[]) => {
          this.filteredEnquiries = data;
          this.currentPage = 0;
          this.updatePagination();
          this.isLoading = false;
        },

        error: (error) => {
          console.error(
            'Enquiry search failed:',
            error
          );

          this.errorMessage =
            'Unable to search enquiries. Please try again.';

          this.filteredEnquiries = [];
          this.pagedEnquiries = [];
          this.totalPages = 0;
          this.isLoading = false;
        }
      });
  }

  filterEnquiries(): void {
    this.searchSubject.next(this.searchText);
  }

  clearSearch(): void {
    this.searchText = '';
    this.filteredEnquiries = this.enquiries;
    this.currentPage = 0;
    this.updatePagination();
    this.errorMessage = '';
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredEnquiries.length / this.pageSize);
    const start = this.currentPage * this.pageSize;
    this.pagedEnquiries = this.filteredEnquiries.slice(start, start + this.pageSize);
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
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  hasAnswer(enquiry: Enquiry): boolean {
    return Boolean(
      enquiry.answer &&
      enquiry.answer.trim().length > 0
    );
  }

  answerEnquiry(id: number): void {
    this.router.navigate(['/admin/enquiries', id, 'edit']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  openDetails(title: string, text: string | undefined): void {
    if (!text || !text.trim()) {
      return;
    }
  
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