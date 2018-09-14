import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Generated class for the DialogTipComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'dialog-tip',
  templateUrl: 'dialog-tip.html'
})
export class DialogTipComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() btnArr: Array<String>;
  @Output() fromChild = new EventEmitter()
  // @Output() fromChildOver = new EventEmitter()
  constructor() {}

  doSomething(item){
    this.fromChild.emit(item)
  }
}
