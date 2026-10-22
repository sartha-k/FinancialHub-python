import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FeedbackService } from 'src/app/services/feedback.service';
import { Feedback } from 'src/app/models/feedback.model';

@Component({
  selector: 'app-userviewfeedback',
  standalone: false,
  templateUrl: './userviewfeedback.component.html',
  styleUrls: ['./userviewfeedback.component.css']
})
export class UserviewfeedbackComponent implements OnInit, OnDestroy {

  selectedUser: any;
  displayPopup = false;
  feedbackList: Feedback[] = [];
  filteredFeedbackList: Feedback[] = [];
  searchText = '';
  errorMessage = '';
  isLoading = false;
  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  pages: number[] = [];

  showDetails = false;
  selectedTitle = '';
  selectedText = '';
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private feedbackService: FeedbackService) {}

  ngOnInit(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.errorMessage = 'User ID is not available. Please login again.';
      return;
    }
    this.loadFeedbacks();
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(term => {
      this.currentPage = 0;
      if (term.trim() === '') {
        this.loadFeedbacks();
      } else {
        const uid = Number(localStorage.getItem('userId'));
        this.feedbackService.searchFeedbacksByUserId(uid, term, this.currentPage, this.pageSize).subscribe(data => {
          this.filteredFeedbackList = data.content;
          this.totalPages = data.totalPages;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
        });
      }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  loadFeedbacks(): void {
    const userId = Number(localStorage.getItem('userId'));
    if (!userId) {
      this.errorMessage = 'User ID is not available. Please login again.';
      this.isLoading = false;
      return;
    }
    this.isLoading = true;
    this.errorMessage = '';
    this.feedbackService.getAllFeedbacksByUserIdPage(userId, this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        setTimeout(() => {
          this.feedbackList = data.content;
          this.filteredFeedbackList = data.content;
          this.totalPages = data.totalPages;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
          this.isLoading = false;
        }, 1500);
      },
      error: (error) => {
        console.error('Unable to load feedback:', error);
        setTimeout(() => {
          this.errorMessage = error.error?.message || 'Unable to load feedback. Please try again.';
          this.feedbackList = [];
          this.filteredFeedbackList = [];
          this.totalPages = 0;
          this.pages = [];
          this.isLoading = false;
        }, 1500);
      }
    });
  }

  filterFeedbacks(): void {
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
    if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      if (this.searchText.trim()) {
        const userId = Number(localStorage.getItem('userId'));
        this.feedbackService.searchFeedbacksByUserId(userId, this.searchText, this.currentPage, this.pageSize).subscribe(data => {
          this.filteredFeedbackList = data.content;
          this.totalPages = data.totalPages;
          this.pages = Array.from({ length: this.totalPages }, (_, i) => i);
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
}