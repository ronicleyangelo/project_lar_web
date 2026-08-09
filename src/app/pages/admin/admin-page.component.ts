import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';

@Component({
  selector: 'app-admin-page',
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  adminMetrics: any = {};
  adminProviders: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadAdminDashboard();
  }

  loadAdminDashboard() {
    this.adminService.getMetrics().subscribe(m => this.adminMetrics = m);
    this.adminService.getProviders().subscribe(p => this.adminProviders = p);
  }

  toggleVerifyProvider(provider: any) {
    this.adminService.verifyProvider(provider.id, provider.isVerified).subscribe();
  }
}