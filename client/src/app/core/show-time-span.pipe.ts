import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showTimeSpan'
})
export class ShowTimeSpanPipe implements PipeTransform {

  transform(value: number, ...args: unknown[]): string {
    const abs = Math.abs(value);
    const sign = value < 0 ? '-' : '';
    return `${sign}${ Math.floor(abs / 60).toString().padStart(2, '0') }:${ (abs % 60).toString().padStart(2, '0') } `;
  }

}
