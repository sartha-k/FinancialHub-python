import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FeedbackService } from 'src/app/services/feedback.service';

@Component({
  selector: 'app-adminviewfeedback',
  standalone: false,
  templateUrl: './adminviewfeedback.component.html',
  styleUrls: ['./adminviewfeedback.component.css']
})
export class AdminviewfeedbackComponent implements OnInit, OnDestroy {

  feedbackList: any[] = [];
  filteredFeedbackList: any[] = [];
  searchText = '';

  selectedUser: any;
  displayPopup = false;
  displayDeletePopup = false;
  feedbackToDeleteId: number | null = null;

  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  pages: number[] = [];

  showDetails = false;
  selectedTitle = '';
  selectedText = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.loadFeedbacks();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(term => {
      this.currentPage = 0;
      if (term.trim() === '') {
        this.loadFeedbacks();
      } else {
        this.feedbackService.searchAllFeedbacks(term, this.currentPage, this.pageSize).subscribe({
          next: (data) => {
            this.filteredFeedbackList = data.content;
            this.totalPages = data.totalPages;
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          },
          error: () => this.errorMessage = 'Search failed.'
        });
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  filterFeedbacks(): void {
    this.searchSubject.next(this.searchText);
  }

  loadFeedbacks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.feedbackService
      .getFeedbacksPage(
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (data) => {
          setTimeout(() => {
            this.feedbackList = data.content;
            this.filteredFeedbackList = data.content;
            this.totalPages = data.totalPages;

            this.pages = Array.from(
              { length: this.totalPages },
              (_, index) => index
            );

            this.isLoading = false;
          }, 1500);
        },

        error: (error) => {
          console.error(
            'Unable to load feedback:',
            error
          );

          setTimeout(() => {
            this.errorMessage =
              error.error?.message ||
              'Unable to load feedback. Please try again.';

            this.feedbackList = [];
            this.filteredFeedbackList = [];
            this.totalPages = 0;
            this.pages = [];
            this.isLoading = false;
          }, 1500);
        }
      });
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
    if (
      page >= 0 &&
      page < this.totalPages &&
      page !== this.currentPage
    ) {
      this.currentPage = page;
      if (this.searchText.trim()) {
        this.feedbackService.searchAllFeedbacks(this.searchText, this.currentPage, this.pageSize).subscribe({
          next: (data) => {
            this.filteredFeedbackList = data.content;
            this.totalPages = data.totalPages;
            this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          }
        });
      } else {
        this.loadFeedbacks();
      }
    }
  }

  showProfile(user: any): void {
    this.selectedUser = user;
    this.displayPopup = true;
  }

  closePopup(): void {
    this.displayPopup = false;
    this.selectedUser = null;
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

  openDeleteConfirmation(feedbackId: number): void {
    this.feedbackToDeleteId = feedbackId;
    this.displayDeletePopup = true;
  
    this.displayPopup = false;
    this.selectedUser = null;
  }
  
  cancelDelete(): void {
    this.displayDeletePopup = false;
    this.feedbackToDeleteId = null;
  }
  
  confirmDelete(): void {
    if (this.feedbackToDeleteId === null) {
      return;
    }
  
    const feedbackId = this.feedbackToDeleteId;
  
    this.displayDeletePopup = false;
    this.feedbackToDeleteId = null;
  
    this.deleteFeedback(feedbackId);
  }

  deleteFeedback(feedbackId: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.displayPopup = false;
   

    this.feedbackService
      .deleteFeedback(feedbackId)
      .subscribe({
        next: () => {
          if (
            this.feedbackList.length === 1 &&
            this.currentPage > 0
          ) {
            this.currentPage--;
          }

          this.loadFeedbacks();
        },

        error: (error) => {
          console.error(
            'Unable to delete feedback:',
            error
          );

          setTimeout(() => {
            this.errorMessage =
              error.error?.message ||
              'Unable to delete feedback. Please try again.';

            this.isLoading = false;
          }, 1500);
        }
      });
  }
}