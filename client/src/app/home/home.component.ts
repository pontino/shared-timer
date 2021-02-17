import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { TimerData, TimerService } from '../core/timer.service';
import { ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ShowTimeSpanPipe } from '../core/show-time-span.pipe';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  showTimeSpan = new ShowTimeSpanPipe();

  messages$: Observable<string>;
  currentPassword = '';
  data: TimerData;
  currentState: string;
  mainInterval: number;
  minutes = 5;
  seconds = 0;

  constructor(
    public srv: TimerService,
    public route: ActivatedRoute,
    public title: Title
  ) {

  }

  ngOnInit(): void {

    this.title.setTitle('Timer');

    this.route.paramMap.subscribe(p => {
      if (p.get('view')) {
        this.currentPassword = p.get('view');
        sessionStorage.setItem('last-pass', this.currentPassword);
      }
      this.srv.connect();
    });

    this.srv.data$.subscribe(newData => {
      this.data = newData;
      this.updateState();
    });
    this.messages$ = this.srv.getMessages$();
  }

  private updateState(): void {
    if (!this.data) {
      this.title.setTitle('Timer');
      return;
    }
    this.title.setTitle('Timer ' + this.data.room);

    if (this.data.status === 'running') {
      if (this.mainInterval) {
        clearInterval(this.mainInterval);
      }
      this.mainInterval = setInterval(() => {
        if (this.data) {
          if (this.data.status === 'running') {
            this.data.seconds--;
          }
        }
      }, 1000);
    }
  }

  onPasswordChanged(e: Event): void {
    this.currentPassword = (e.target as HTMLInputElement).value;
  }

  sendPassword(): void {
    if (this.currentPassword) {
      this.srv.sendPassword(this.currentPassword);
      this.currentPassword = '';
    }
  }

  simulateDisconnection(): void {
    this.srv.simulateDisconnection();
  }

  simulateReconnection(): void {
    this.srv.simulateReconnection();
  }

  setStatus(): void {
    this.srv.setStatus({ status: 'running', seconds: -50 });
  }

  pause(): void {
    this.srv.setStatus({ status: 'pause' });
  }

  unpause(): void {
    this.srv.setStatus({ status: 'running', seconds: this.data.seconds });
  }

  setNewTimer(): void {
    this.srv.setStatus({ status: 'pause', seconds: this.minutes * 60 + this.seconds });
  }

  setNextTimer(minutes: number, seconds: number): void {
    this.minutes = minutes;
    this.seconds = seconds;
  }

  logout(): void {
    this.currentPassword = '';
    sessionStorage.removeItem('last-pass');
    this.srv.disconnect();
  }
}
