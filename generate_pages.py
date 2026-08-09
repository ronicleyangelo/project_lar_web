import os

base_dir = r"c:\Users\ronic\Documents\projeto\project_lar\frontend\src\app\pages"

files = {
  "search/search-routing.module.ts": """import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchPageComponent } from './search-page.component';

const routes: Routes = [{ path: '', component: SearchPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }""",
  
  "search/search.module.ts": """import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { SearchRoutingModule } from './search-routing.module';
import { SearchPageComponent } from './search-page.component';

@NgModule({
  declarations: [SearchPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }""",

  "search/search-page.component.ts": """import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryService } from '../../core/services/category.service';
import { RecommendationService } from '../../core/services/recommendation.service';
import { AuthService } from '../../core/services/auth.service';
import { Category, Recommendation, SearchParams } from '../../core/models';

@Component({
  selector: 'app-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.css']
})
export class SearchPageComponent implements OnInit {
  categories: Category[] = [];
  selectedCategoryId: string = '';
  searchCity: string = 'São Paulo';
  searchNeighborhood: string = 'Moema';
  searchBudget: number = 500;
  
  recommendations: Recommendation[] = [];
  selectedProviderBreakdown: Recommendation | null = null;
  showBreakdown: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private recommendationService: RecommendationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categoryService.getAll().subscribe(cats => {
      this.categories = cats;
    });
    this.runSearch();
  }

  runSearch(): void {
    const params: SearchParams = {
      categoryId: this.selectedCategoryId,
      city: this.searchCity,
      neighborhood: this.searchNeighborhood,
      maxBudget: this.searchBudget
    };
    this.recommendationService.search(params).subscribe(results => {
      this.recommendations = results;
    });
  }

  onRequestQuote(recommendation: Recommendation): void {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/client']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}""",

  "search/search-page.component.html": """<div class="hero-section">
  <div class="container py-5">
    <div class="hero-card p-4">
      <h2 class="section-title text-center mb-4">Encontre os melhores profissionais</h2>
      <div class="row g-3">
        <div class="col-12 col-sm-6 col-lg-3">
          <select class="form-select" [(ngModel)]="selectedCategoryId">
            <option value="">Todas as categorias</option>
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <input type="text" class="form-control" [(ngModel)]="searchCity" placeholder="Cidade">
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <input type="text" class="form-control" [(ngModel)]="searchNeighborhood" placeholder="Bairro">
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <input type="number" class="form-control" [(ngModel)]="searchBudget" placeholder="Orçamento (R$)">
        </div>
        <div class="col-12 mt-4 text-center">
          <button class="btn btn-primary px-5" style="background-color: var(--ocean-blue); border: none;" (click)="runSearch()">Buscar</button>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="container py-5">
  <h3 class="mb-3">Resultados da Busca <span class="info-tag ms-2">{{ recommendations.length }} encontrados</span></h3>
  
  <div class="row g-4" *ngIf="recommendations.length > 0; else noResults">
    <div class="col-12 col-md-6 col-lg-4" *ngFor="let item of recommendations">
      <app-provider-card 
        [recommendation]="item" 
        [searchNeighborhood]="searchNeighborhood"
        (requestQuote)="onRequestQuote($event)"
        (showBreakdown)="selectedProviderBreakdown = $event; showBreakdown = true">
      </app-provider-card>
    </div>
  </div>
  
  <ng-template #noResults>
    <app-empty-state icon="search_off" message="Nenhum profissional encontrado com os filtros atuais."></app-empty-state>
  </ng-template>
</div>

<app-score-breakdown-dialog *ngIf="showBreakdown" [(visible)]="showBreakdown" [recommendation]="selectedProviderBreakdown!"></app-score-breakdown-dialog>""",

  "search/search-page.component.css": """.hero-section {
  background: linear-gradient(135deg, var(--ocean-blue, #0284c7), var(--dark-blue-deep, #0b1329));
  color: white;
}

.hero-card {
  background-color: var(--bg-main, #ffffff);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  color: var(--text-primary, #1e293b);
}

.section-title {
  color: var(--dark-blue-deep, #0b1329);
  font-weight: bold;
}

.info-tag {
  background-color: var(--gold-primary, #f59e0b);
  color: var(--dark-blue-deep, #0b1329);
  font-size: 0.9rem;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: bold;
  vertical-align: middle;
}""",

  "client/client-routing.module.ts": """import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientPageComponent } from './client-page.component';

const routes: Routes = [{ path: '', component: ClientPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientRoutingModule { }""",

  "client/client.module.ts": """import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ClientRoutingModule } from './client-routing.module';
import { ClientPageComponent } from './client-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [ClientPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ClientRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ClientModule { }""",

  "client/client-page.component.ts": """import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../core/services/request.service';
import { QuoteService } from '../../core/services/quote.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { ReviewService } from '../../core/services/review.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/services/auth.service';
import { ServiceRequest, Appointment, Category, CreateRequestPayload, CreateReviewPayload } from '../../core/models';

@Component({
  selector: 'app-client-page',
  templateUrl: './client-page.component.html',
  styleUrls: ['./client-page.component.css']
})
export class ClientPageComponent implements OnInit {
  clientRequests: ServiceRequest[] = [];
  appointments: Appointment[] = [];
  categories: Category[] = [];
  
  showNewRequestModal: boolean = false;
  newReq: Partial<CreateRequestPayload> = {};
  
  showRatingModal: boolean = false;
  selectedAppointmentId: string = '';

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService,
    private appointmentService: AppointmentService,
    private reviewService: ReviewService,
    private categoryService: CategoryService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadClientRequests();
    this.loadAppointments();
    this.loadCategories();
  }

  loadClientRequests() {
    this.requestService.getClientRequests().subscribe(reqs => this.clientRequests = reqs);
  }

  loadAppointments() {
    this.appointmentService.getAll().subscribe(apps => this.appointments = apps);
  }

  loadCategories() {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  submitNewRequest() {
    if (this.newReq.categoryId && this.newReq.description) {
      this.requestService.create(this.newReq as CreateRequestPayload).subscribe(() => {
        this.showNewRequestModal = false;
        this.loadClientRequests();
      });
    }
  }

  acceptQuote(quoteId: string) {
    this.quoteService.accept(quoteId).subscribe(() => {
      this.loadClientRequests();
      this.loadAppointments();
    });
  }

  completeAppointment(id: string) {
    this.appointmentService.complete(id).subscribe(() => {
      this.loadAppointments();
    });
  }

  openRating(appId: string) {
    this.selectedAppointmentId = appId;
    this.showRatingModal = true;
  }

  onSubmitReview(payload: any) {
    const review: CreateReviewPayload = {
      appointmentId: this.selectedAppointmentId,
      rating: payload.rating,
      comment: payload.comment
    };
    this.reviewService.create(review).subscribe(() => {
      this.showRatingModal = false;
      this.loadAppointments();
    });
  }
}""",

  "client/client-page.component.html": """<div class="container py-5">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h2 class="mb-0">Meus Pedidos</h2>
    <button class="btn btn-primary" style="background-color: var(--ocean-blue); border: none;" (click)="showNewRequestModal = true">Novo Pedido</button>
  </div>

  <div class="row g-4">
    <div class="col-12" *ngFor="let req of clientRequests">
      <div class="card request-card">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <p-tag [value]="req.categoryId" severity="info"></p-tag>
            <p-tag [value]="req.status" [severity]="req.status === 'OPEN' ? 'warning' : 'success'"></p-tag>
          </div>
          <h5 class="mt-2">{{ req.description }}</h5>
          <p class="text-muted small">Criado em: {{ req.createdAt | date }}</p>
          
          <div class="privacy-notice mb-3">
            <span class="material-symbols-outlined align-middle fs-6 me-1">lock</span>
            <small>Seu endereço completo está oculto. Ele será liberado apenas para o profissional cujo orçamento for aprovado.</small>
          </div>

          <div class="quotes-box" *ngIf="req.quotes && req.quotes.length > 0">
            <h6>Orçamentos Recebidos</h6>
            <div class="quote-item d-flex justify-content-between align-items-center p-2 mb-2 border rounded" *ngFor="let q of req.quotes">
              <div>
                <strong>Profissional ID: {{ q.providerId }}</strong>
                <p class="mb-0 small">{{ q.message }}</p>
              </div>
              <div class="text-end">
                <div class="quote-price">R$ {{ q.price }}</div>
                <button class="btn btn-sm btn-success mt-1" *ngIf="req.status === 'OPEN'" (click)="acceptQuote(q.id)">Aceitar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <h2 class="mt-5 mb-4">Meus Agendamentos</h2>
  <div class="row g-4">
    <div class="col-12 col-md-6" *ngFor="let app of appointments">
      <div class="card">
        <div class="card-body">
          <h5>Agendamento #{{ app.id }}</h5>
          <p>Status: <p-tag [value]="app.status"></p-tag></p>
          <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary btn-sm" *ngIf="app.status === 'SCHEDULED'" (click)="completeAppointment(app.id)">Marcar Concluído</button>
            <button class="btn btn-outline-warning btn-sm" *ngIf="app.status === 'COMPLETED'" (click)="openRating(app.id)">Avaliar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<p-dialog header="Novo Pedido" [(visible)]="showNewRequestModal" [modal]="true" [style]="{width: '50vw'}">
  <div class="mb-3">
    <label class="form-label">Categoria</label>
    <select class="form-select" [(ngModel)]="newReq.categoryId">
      <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
    </select>
  </div>
  <div class="mb-3">
    <label class="form-label">Descrição do Problema</label>
    <textarea class="form-control" rows="3" [(ngModel)]="newReq.description"></textarea>
  </div>
  <div class="mb-3">
    <label class="form-label">Cidade</label>
    <input type="text" class="form-control" [(ngModel)]="newReq.addressCity">
  </div>
  <div class="mb-3">
    <label class="form-label">Bairro</label>
    <input type="text" class="form-control" [(ngModel)]="newReq.addressNeighborhood">
  </div>
  <div class="mb-3">
    <label class="form-label">CEP (Ficará oculto)</label>
    <input type="text" class="form-control" [(ngModel)]="newReq.addressZip">
  </div>
  <button class="btn btn-primary w-100" style="background-color: var(--ocean-blue); border: none;" (click)="submitNewRequest()">Publicar Pedido</button>
</p-dialog>

<app-rating-dialog *ngIf="showRatingModal" [(visible)]="showRatingModal" (submitReview)="onSubmitReview($event)"></app-rating-dialog>""",

  "client/client-page.component.css": """.request-card {
  border-left: 4px solid var(--ocean-blue, #0284c7);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.privacy-notice {
  background-color: var(--burnt-gray, #e2e5e9);
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--dark-blue-deep, #0b1329);
}

.quotes-box {
  background-color: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}

.quote-item {
  background-color: white;
}

.quote-price {
  font-weight: bold;
  color: var(--ocean-blue, #0284c7);
  font-size: 1.1rem;
}""",

  "provider/provider-routing.module.ts": """import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderPageComponent } from './provider-page.component';

const routes: Routes = [{ path: '', component: ProviderPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderRoutingModule { }""",

  "provider/provider.module.ts": """import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { ProviderRoutingModule } from './provider-routing.module';
import { ProviderPageComponent } from './provider-page.component';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';

@NgModule({
  declarations: [ProviderPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    ProviderRoutingModule,
    DialogModule,
    TagModule
  ]
})
export class ProviderModule { }""",

  "provider/provider-page.component.ts": """import { Component, OnInit } from '@angular/core';
import { RequestService } from '../../core/services/request.service';
import { QuoteService } from '../../core/services/quote.service';
import { ServiceRequest, SendQuotePayload } from '../../core/models';

@Component({
  selector: 'app-provider-page',
  templateUrl: './provider-page.component.html',
  styleUrls: ['./provider-page.component.css']
})
export class ProviderPageComponent implements OnInit {
  openProviderRequests: ServiceRequest[] = [];
  
  showQuoteModal: boolean = false;
  quoteRequestId: string = '';
  quotePrice: number = 0;
  quoteDuration: number = 0;
  quoteMessage: string = '';

  constructor(
    private requestService: RequestService,
    private quoteService: QuoteService
  ) {}

  ngOnInit(): void {
    this.loadProviderOpenRequests();
  }

  loadProviderOpenRequests() {
    this.requestService.getProviderOpenRequests().subscribe(reqs => {
      this.openProviderRequests = reqs;
    });
  }

  openSendQuoteModal(reqId: string) {
    this.quoteRequestId = reqId;
    this.quotePrice = 0;
    this.quoteDuration = 0;
    this.quoteMessage = '';
    this.showQuoteModal = true;
  }

  submitQuote() {
    const payload: SendQuotePayload = {
      requestId: this.quoteRequestId,
      price: this.quotePrice,
      estimatedDurationHours: this.quoteDuration,
      message: this.quoteMessage
    };
    this.quoteService.send(payload).subscribe(() => {
      this.showQuoteModal = false;
    });
  }
}""",

  "provider/provider-page.component.html": """<div class="container py-5">
  <h2 class="mb-4">Pedidos Disponíveis</h2>

  <div class="row g-4" *ngIf="openProviderRequests.length > 0; else noReqs">
    <div class="col-12 col-md-6" *ngFor="let req of openProviderRequests">
      <div class="card h-100 request-card">
        <div class="card-body">
          <p-tag [value]="req.categoryId" severity="info" class="mb-2 d-inline-block"></p-tag>
          <h5 class="card-title">{{ req.description }}</h5>
          <p class="text-muted small mb-2">Bairro: {{ req.addressNeighborhood }} - {{ req.addressCity }}</p>
          
          <div class="alert alert-secondary py-2 px-3 small d-flex align-items-center mb-3">
            <span class="material-symbols-outlined me-2 fs-6">lock</span>
            Endereço exato oculto. Liberação após aprovação.
          </div>

          <button class="btn w-100 send-btn" (click)="openSendQuoteModal(req.id)">Enviar Orçamento</button>
        </div>
      </div>
    </div>
  </div>

  <ng-template #noReqs>
    <app-empty-state icon="work_off" message="Não há pedidos disponíveis na sua região no momento."></app-empty-state>
  </ng-template>
</div>

<p-dialog header="Enviar Orçamento" [(visible)]="showQuoteModal" [modal]="true" [style]="{width: '400px'}">
  <div class="mb-3">
    <label class="form-label">Preço Estimado (R$)</label>
    <input type="number" class="form-control" [(ngModel)]="quotePrice">
  </div>
  <div class="mb-3">
    <label class="form-label">Duração Estimada (Horas)</label>
    <input type="number" class="form-control" [(ngModel)]="quoteDuration">
  </div>
  <div class="mb-3">
    <label class="form-label">Mensagem para o cliente</label>
    <textarea class="form-control" rows="3" [(ngModel)]="quoteMessage"></textarea>
  </div>
  <button class="btn btn-primary w-100" style="background-color: var(--ocean-blue); border: none;" (click)="submitQuote()">Enviar</button>
</p-dialog>""",

  "provider/provider-page.component.css": """.request-card {
  border: 1px solid var(--burnt-gray, #e2e5e9);
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.send-btn {
  background-color: var(--gold-primary, #f59e0b);
  color: var(--dark-blue-deep, #0b1329);
  font-weight: bold;
  border: none;
}
.send-btn:hover {
  background-color: #d97706;
  color: white;
}""",

  "admin/admin-routing.module.ts": """import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from './admin-page.component';

const routes: Routes = [{ path: '', component: AdminPageComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }""",

  "admin/admin.module.ts": """import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPageComponent } from './admin-page.component';
import { TableModule } from 'primeng/table';
import { InputSwitchModule } from 'primeng/inputswitch';

@NgModule({
  declarations: [AdminPageComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AdminRoutingModule,
    TableModule,
    InputSwitchModule
  ]
})
export class AdminModule { }""",

  "admin/admin-page.component.ts": """import { Component, OnInit } from '@angular/core';
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
}""",

  "admin/admin-page.component.html": """<div class="container py-5">
  <h2 class="mb-4 text-center">Dashboard Administrativo</h2>
  
  <div class="row g-3 mb-5">
    <div class="col-6 col-md-3">
      <div class="metric-card">
        <div class="metric-title">Total Usuários</div>
        <div class="metric-value">{{ adminMetrics.totalUsers || 0 }}</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="metric-card">
        <div class="metric-title">Profissionais</div>
        <div class="metric-value">{{ adminMetrics.totalProviders || 0 }}</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="metric-card">
        <div class="metric-title">Pedidos Abertos</div>
        <div class="metric-value">{{ adminMetrics.openRequests || 0 }}</div>
      </div>
    </div>
    <div class="col-6 col-md-3">
      <div class="metric-card">
        <div class="metric-title">Agendamentos</div>
        <div class="metric-value">{{ adminMetrics.completedAppointments || 0 }}</div>
      </div>
    </div>
  </div>

  <h4 class="mb-3">Verificação de Profissionais</h4>
  <p-table [value]="adminProviders" [paginator]="true" [rows]="10" responsiveLayout="scroll">
    <ng-template pTemplate="header">
      <tr>
        <th>ID</th>
        <th>Nome</th>
        <th>Status BG Check</th>
        <th>Verificado (Selo)</th>
      </tr>
    </ng-template>
    <ng-template pTemplate="body" let-provider>
      <tr>
        <td>{{ provider.id }}</td>
        <td>{{ provider.userId }}</td>
        <td>{{ provider.backgroundCheckStatus }}</td>
        <td>
          <p-inputSwitch [(ngModel)]="provider.isVerified" (onChange)="toggleVerifyProvider(provider)"></p-inputSwitch>
        </td>
      </tr>
    </ng-template>
  </p-table>
</div>""",

  "admin/admin-page.component.css": """.metric-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  border-top: 4px solid var(--ocean-blue, #0284c7);
  text-align: center;
}
.metric-title {
  color: var(--text-primary, #1e293b);
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: bold;
}
.metric-value {
  color: var(--dark-blue-deep, #0b1329);
  font-size: 2rem;
  font-weight: bold;
  margin-top: 10px;
}""",

  "auth/auth-routing.module.ts": """import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }""",

  "auth/auth.module.ts": """import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    AuthRoutingModule
  ]
})
export class AuthModule { }""",

  "auth/login/login.component.ts": """import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/']),
      error: err => this.error = 'Login falhou. Verifique suas credenciais.'
    });
  }
}""",

  "auth/login/login.component.html": """<div class="auth-wrapper">
  <div class="auth-card card">
    <div class="card-body p-4">
      <h3 class="text-center mb-4 auth-title">Entrar</h3>
      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" [(ngModel)]="email">
      </div>
      <div class="mb-4">
        <label class="form-label">Senha</label>
        <input type="password" class="form-control" [(ngModel)]="password">
      </div>
      <button class="btn btn-primary w-100 auth-btn" (click)="onLogin()">Login</button>
      <div class="mt-3 text-center">
        <a routerLink="/auth/register" class="auth-link">Não tem conta? Cadastre-se</a>
      </div>
    </div>
  </div>
</div>""",

  "auth/login/login.component.css": """.auth-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main, #f8f9fa);
}
.auth-card {
  width: 100%;
  max-width: 400px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-top: 5px solid var(--ocean-blue, #0284c7);
}
.auth-title {
  color: var(--dark-blue-deep, #0b1329);
  font-weight: bold;
}
.auth-btn {
  background: linear-gradient(135deg, var(--ocean-blue, #0284c7), var(--dark-blue-deep, #0b1329));
  border: none;
}
.auth-link {
  color: var(--ocean-blue, #0284c7);
  text-decoration: none;
}""",

  "auth/register/register.component.ts": """import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerRole: 'CLIENT' | 'PROVIDER' = 'CLIENT';
  
  name = '';
  email = '';
  password = '';
  phone = '';
  
  // Client only
  city = '';
  
  // Provider only
  docNumber = '';
  categoryId = '';
  categories: Category[] = [];

  error = '';

  constructor(
    private authService: AuthService,
    private categoryService: CategoryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryService.getAll().subscribe(cats => this.categories = cats);
  }

  onRegister() {
    if (this.registerRole === 'CLIENT') {
      this.authService.registerClient({
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.phone,
        city: this.city
      }).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.error = 'Erro ao cadastrar cliente'
      });
    } else {
      this.authService.registerProvider({
        name: this.name,
        email: this.email,
        password: this.password,
        phone: this.phone,
        documentNumber: this.docNumber,
        categoryId: this.categoryId
      }).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => this.error = 'Erro ao cadastrar profissional'
      });
    }
  }
}""",

  "auth/register/register.component.html": """<div class="auth-wrapper">
  <div class="auth-card card">
    <div class="card-body p-4">
      <h3 class="text-center mb-4 auth-title">Criar Conta</h3>
      
      <div class="d-flex justify-content-center mb-4">
        <div class="btn-group" role="group">
          <input type="radio" class="btn-check" name="role" id="client" value="CLIENT" [(ngModel)]="registerRole">
          <label class="btn btn-outline-primary" for="client">Sou Cliente</label>

          <input type="radio" class="btn-check" name="role" id="provider" value="PROVIDER" [(ngModel)]="registerRole">
          <label class="btn btn-outline-primary" for="provider">Sou Profissional</label>
        </div>
      </div>

      <div *ngIf="error" class="alert alert-danger">{{ error }}</div>

      <div class="mb-3">
        <label class="form-label">Nome Completo</label>
        <input type="text" class="form-control" [(ngModel)]="name">
      </div>
      <div class="mb-3">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" [(ngModel)]="email">
      </div>
      <div class="mb-3">
        <label class="form-label">Senha</label>
        <input type="password" class="form-control" [(ngModel)]="password">
      </div>
      <div class="mb-3">
        <label class="form-label">Telefone</label>
        <input type="text" class="form-control" [(ngModel)]="phone">
      </div>

      <ng-container *ngIf="registerRole === 'CLIENT'">
        <div class="mb-3">
          <label class="form-label">Cidade</label>
          <input type="text" class="form-control" [(ngModel)]="city">
        </div>
      </ng-container>

      <ng-container *ngIf="registerRole === 'PROVIDER'">
        <div class="mb-3">
          <label class="form-label">CPF / CNPJ</label>
          <input type="text" class="form-control" [(ngModel)]="docNumber">
        </div>
        <div class="mb-3">
          <label class="form-label">Categoria Principal</label>
          <select class="form-select" [(ngModel)]="categoryId">
            <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
          </select>
        </div>
      </ng-container>

      <button class="btn btn-primary w-100 auth-btn mt-3" (click)="onRegister()">Cadastrar</button>
      
      <div class="mt-3 text-center">
        <a routerLink="/auth/login" class="auth-link">Já tem conta? Faça Login</a>
      </div>
    </div>
  </div>
</div>""",

  "auth/register/register.component.css": """.auth-wrapper {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-main, #f8f9fa);
  padding: 20px;
}
.auth-card {
  width: 100%;
  max-width: 500px;
  border: none;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  border-top: 5px solid var(--ocean-blue, #0284c7);
}
.auth-title {
  color: var(--dark-blue-deep, #0b1329);
  font-weight: bold;
}
.auth-btn {
  background: linear-gradient(135deg, var(--ocean-blue, #0284c7), var(--dark-blue-deep, #0b1329));
  border: none;
}
.auth-link {
  color: var(--ocean-blue, #0284c7);
  text-decoration: none;
}"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path.replace("/", "\\\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("done")
