import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  loaders: number[] = [];
  loaderAction: BehaviorSubject<number[]> = new BehaviorSubject<number[]>(this.loaders);
  loaders$ = this.loaderAction.asObservable();
  show() {
    const id = new Date().getTime();
    this.loaders.push(id);
    this.loaderAction.next(this.loaders);
    return id;
  }
  hide(id: number) {
    this.loaders = this.loaders.filter((loader) => loader !== id);
    this.loaderAction.next(this.loaders);
  }
}
