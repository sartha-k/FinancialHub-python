import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { Subject } from 'rxjs';

import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import { Enquiry } from 'src/app/models/enquiry.model';
import { EnquiryService } from 'src/app/services/enquiry.service';

@Component({
  selector: 'app-userviewenquiry',
  templateUrl: './userviewenquiry.component.html',
  styleUrls: ['./userviewenquiry.component.css']
})
export class UserviewenquiryComponent
  implements OnInit, OnDestroy {

  enquiries: Enquiry[] = [];
  filteredEnquiries: Enquiry[] = [];
  pagedEnquiries: Enquiry[] = [];

  searchText = '';
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;

  showDetails = false;
  selectedTitle = '';
  selectedText = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private enquiryService: EnquiryService
  ) {}

  ngOnInit(): void {
    this.loadUserEnquiries();
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
        this.applyLocalFilter(term);
      });
  }

  loadUserEnquiries(): void {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      this.errorMessage =
        'User information was not found. Please log in again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.enquiryService
      .getUserEnquiries(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Enquiry[]) => {
          this.enquiries = data;
          this.filteredEnquiries = data;
          this.currentPage = 0;
          this.updatePagination();
          this.isLoading = false;
        },

        error: (error) => {
          console.error(
            'Unable to load service requests:',
            error
          );

          this.errorMessage =
            typeof error.error === 'string' &&
            error.error.trim() !== ''
              ? error.error
              : error.error?.message ||
                'Unable to load service requests. Please try again.';

          this.enquiries = [];
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

  private applyLocalFilter(term: string): void {
    const searchTerm = term.trim().toLowerCase();

    if (!searchTerm) {
      this.filteredEnquiries = this.enquiries;
    } else {
      this.filteredEnquiries = this.enquiries.filter(
        (enquiry: Enquiry) => {
          const status = this.hasResponse(enquiry) ? 'responded' : 'pending review';
          return (
            enquiry.message.toLowerCase().includes(searchTerm) ||
            (enquiry.answer || '').toLowerCase().includes(searchTerm) ||
            status.includes(searchTerm)
          );
        }
      );
    }

    this.currentPage = 0;
    this.updatePagination();
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

  hasResponse(enquiry: Enquiry): boolean {
    return Boolean(
      enquiry.answer &&
      enquiry.answer.trim().length > 0
    );
  }

  openDetails(
    title: string,
    text: string | undefined
  ): void {

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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}