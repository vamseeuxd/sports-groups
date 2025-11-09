import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private loaders: number[] = [];
  private loaderAction = new BehaviorSubject<number[]>(this.loaders);
  loaders$ = this.loaderAction.asObservable();
  
  show(): number {
    const id = Date.now();
    this.loaders.push(id);
    this.loaderAction.next([...this.loaders]);
    return id;
  }
  
  hide(id: number): void {
    this.loaders = this.loaders.filter(loader => loader !== id);
    this.loaderAction.next([...this.loaders]);
  }
}
