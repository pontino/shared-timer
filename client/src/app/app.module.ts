import { NgModule } from '@angular/core';
import { BrowserModule, Title } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';
import { Route, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';

const routes: Route[] = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: ':view',
    component: HomeComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    CoreModule,
    FormsModule,
    RouterModule.forRoot(routes)
  ],
  providers: [Title],
  bootstrap: [AppComponent]
})
export class AppModule {
}
