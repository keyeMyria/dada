import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MyCarPage } from './my-car';

@NgModule({
  declarations: [
    MyCarPage,
  ],
  imports: [
    IonicPageModule.forChild(MyCarPage),
  ],
})
export class MyCarPageModule {}
