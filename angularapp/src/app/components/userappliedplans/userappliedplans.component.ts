import { Component, OnInit } from '@angular/core';
import { PlanApplication } from 'src/app/models/planapplication.model';
import { PlanapplicationService } from 'src/app/services/planapplication.service';

@Component({
  selector: 'app-userappliedplans',
  templateUrl: './userappliedplans.component.html',
  styleUrls: ['./userappliedplans.component.css']
})
export class UserappliedplansComponent implements OnInit {

  applications: PlanApplication[] = [];
  filteredApplications: PlanApplication[] = [];

  currentPage = 0;
  pageSize = 5;
  totalPages = 0;
  pages: number[] = [];
  showImageModal = false;
  selectedDocument = '';
  isLoading = false;
  errorMessage = '';
  isAscending = true;

  searchText = '';
  selectedStatus = '';

  constructor(
    private planApplicationService: PlanapplicationService
  ) {}

  ngOnInit(): void {
    this.loadAppliedPlans();
  }

  loadAppliedPlans(): void {

    const userId = Number(localStorage.getItem('userId'));

    if (!userId) {
      this.errorMessage =
        'User information was not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.planApplicationService
      .getAppliedPlansPage(
        userId,
        this.currentPage,
        this.pageSize
      )
      .subscribe({
        next: (data) => {

          setTimeout(() => {
            this.applications = data.content;
            this.totalPages = data.totalPages;

            this.pages = Array.from(
              { length: this.totalPages },
              (_, index) => index
            );

            this.applyFilters();
            this.isLoading = false;
          }, 1500);
        },

        error: (error) => {

          console.error(
            'Error loading applications:',
            error
          );

          setTimeout(() => {
            this.errorMessage =
              error.error?.message ||
              'Unable to load applied plans.';

            this.applications = [];
            this.filteredApplications = [];
            this.totalPages = 0;
            this.pages = [];
            this.isLoading = false;
          }, 1500);
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.applications];

    if (this.selectedStatus) {
      filtered = filtered.filter(app => app.status === this.selectedStatus);
    }

    if (this.searchText.trim()) {
      const term = this.searchText.trim().toLowerCase();
      filtered = filtered.filter(app =>
        (app.savingsPlan?.name || '').toLowerCase().includes(term)
      );
    }

    this.filteredApplications = filtered;
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
      this.loadAppliedPlans();
    }
  }

  toggleSort(): void {

    if (this.isAscending) {
      this.filteredApplications.sort(
        (a, b) => a.appliedAmount - b.appliedAmount
      );
    } else {
      this.filteredApplications.sort(
        (a, b) => b.appliedAmount - a.appliedAmount
      );
    }

    this.isAscending = !this.isAscending;
  }

  viewDocument(document: string): void {

    if (!document) {
      return;
    }

    this.selectedDocument = document;
    this.showImageModal = true;
  }

  closeModal(): void {
    this.showImageModal = false;
    this.selectedDocument = '';
  }
}