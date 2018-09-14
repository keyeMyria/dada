import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CashFlowPage } from './cash-flow';

@NgModule({
  declarations: [
    CashFlowPage,
  ],
  imports: [
    IonicPageModule.forChild(CashFlowPage),
  ],
})
export class CashFlowPageModule {}
