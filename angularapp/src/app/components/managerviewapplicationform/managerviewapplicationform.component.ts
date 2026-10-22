import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil
} from 'rxjs/operators';

import { PlanApplication } from 'src/app/models/planapplication.model';
import { PlanapplicationService } from 'src/app/services/planapplication.service';

@Component({
  selector: 'app-managerviewapplicationform',
  templateUrl: './managerviewapplicationform.component.html',
  styleUrls: ['./managerviewapplicationform.component.css']
})
export class ManagerviewapplicationformComponent
  implements OnInit, OnDestroy {

  applications: PlanApplication[] = [];
  filteredApplications: PlanApplication[] = [];
  selectedStatus: string = '';
  statusDropdownOpen = false;

  searchText = '';
  isLoading = false;
  errorMessage = '';

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  sortForm!: FormGroup;

  showImageModal = false;
  selectedDocument = '';

  isAscending = true;

  showConfirmationModal = false;
  selectedApplication!: PlanApplication;
  selectedAction = '';
  confirmationMessage = '';

  constructor(
    private service: PlanapplicationService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {

    this.sortForm = this.fb.group({
      sortType: ['']
    });

    this.loadApplications();

    this.searchSubject
  .pipe(
    debounceTime(300),
    distinctUntilChanged(),
    takeUntil(this.destroy$)
  )
  .subscribe(() => {
    this.applyFilters();
  });

    // this.searchSubject
    //   .pipe(
    //     debounceTime(300),
    //     distinctUntilChanged(),
    //     takeUntil(this.destroy$)
    //   )
    //   .subscribe(term => {

    //     if (term.trim() === '') {

    //       this.filteredApplications = [
    //         ...this.applications
    //       ];

    //     } else {

    //       const searchTerm =
    //         term.toLowerCase();

    //       this.filteredApplications =
    //         this.applications.filter(app =>
    //           (app.remarks || '')
    //             .toLowerCase()
    //             .includes(searchTerm) ||

    //           (app.status || '')
    //             .toLowerCase()
    //             .includes(searchTerm)
    //         );
    //     }
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadApplications(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.service
      .getAllPlanApplications()
      .subscribe({

        next: (data) => {

          setTimeout(() => {

            this.applications = data;
            this.filteredApplications = data;

            this.isLoading = false;

          }, 1500);
        },

        error: (error) => {

          console.error(
            'Unable to load applications:',
            error
          );

          setTimeout(() => {

            this.errorMessage =
              typeof error.error === 'string' &&
              error.error.trim() !== ''
                ? error.error
                : error.error?.message ||
                  'Unable to load applications. Please try again.';

            this.applications = [];
            this.filteredApplications = [];

            this.isLoading = false;

          }, 1500);
        }
      });
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.statusDropdownOpen = false;
    this.applyFilters();
  }

  filterApplications(): void {
    this.searchSubject.next(this.searchText);
  }

  toggleSort(): void {

    if (this.isAscending) {

      this.filteredApplications.sort(
        (a, b) =>
          a.appliedAmount - b.appliedAmount
      );

    } else {

      this.filteredApplications.sort(
        (a, b) =>
          b.appliedAmount - a.appliedAmount
      );
    }

    this.isAscending =
      !this.isAscending;
  }

  openConfirmation(
    application: PlanApplication,
    action: string
  ): void {

    this.selectedApplication =
      application;

    this.selectedAction = action;

    if (action === 'APPROVED') {

      this.confirmationMessage =
        'Are you sure you want to Approve this application?';

    } else {

      this.confirmationMessage =
        'Are you sure you want to Reject this application?';
    }

    this.showConfirmationModal = true;
  }

  confirmAction(): void {

    if (
      this.selectedAction ===
      'APPROVED'
    ) {
      this.approve(this.selectedApplication);
    } else {
      this.reject(this.selectedApplication);
    }

    this.closeConfirmationModal();
  }

  closeConfirmationModal(): void {
    this.showConfirmationModal = false;
  }

  approve(
    application: PlanApplication
  ): void {

    const updatedApplication = {
      ...application,
      status: 'APPROVED'
    };

    this.service
      .updatePlanApplication(
        application.planApplicationId!,
        updatedApplication
      )
      .subscribe({

        next: () => {

          application.status =
            'APPROVED';
        },

        error: (error) => {
          console.error(error);
        }
      });
  }

  reject(
    application: PlanApplication
  ): void {

    const updatedApplication = {
      ...application,
      status: 'REJECTED'
    };

    this.service
      .updatePlanApplication(
        application.planApplicationId!,
        updatedApplication
      )
      .subscribe({

        next: () => {

          application.status =
            'REJECTED';
        },

        error: (error) => {
          console.error(error);
        }
      });
  }

  viewDocument(
    document: string
  ): void {

    if (!document) {
      return;
    }

    this.selectedDocument =
      document;

    this.showImageModal = true;
  }

  closeModal(): void {

    this.showImageModal = false;
    this.selectedDocument = '';
  }

  applyFilters(): void {
    let filtered: PlanApplication[] = [...this.applications];
  
    // Filter by status
    if (this.selectedStatus !== '') {
      filtered = filtered.filter(
        (app: PlanApplication) => app.status === this.selectedStatus
      );
    }
  
    // Filter by search text
    if (this.searchText && this.searchText.trim() !== '') {
      const search = this.searchText.trim().toLowerCase();
  
      filtered = filtered.filter((app: PlanApplication) => {
        const remarks = app.remarks ? app.remarks.toLowerCase() : '';
        const status = app.status ? app.status.toLowerCase() : '';
        const planName = app.savingsPlan?.name
          ? app.savingsPlan.name.toLowerCase()
          : '';
  
        return (
          remarks.includes(search) ||
          status.includes(search) ||
          planName.includes(search)
        );
      });
    }
  
    this.filteredApplications = filtered;
  }
}