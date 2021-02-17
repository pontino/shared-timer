import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketIoModule } from 'ngx-socket-io';
import { TimerService } from './timer.service';
import { ShowTimeSpanPipe } from './show-time-span.pipe';
import { environment } from '../../environments/environment';

@NgModule({
  declarations: [ShowTimeSpanPipe],
  imports: [
    CommonModule,
    SocketIoModule.forRoot({
      url: environment.api,
      options: {
        autoConnect: false
      }
    })
  ],
  exports: [
    ShowTimeSpanPipe
  ],
  providers: [
    TimerService
  ]
})
export class CoreModule {
}
