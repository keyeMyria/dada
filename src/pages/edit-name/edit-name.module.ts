import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EditNamePage } from './edit-name';

@NgModule({
  declarations: [
    EditNamePage,
  ],
  imports: [
    IonicPageModule.forChild(EditNamePage),
  ],
})
export class EditNamePageModule {}
