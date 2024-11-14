import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgregarLogrosYPartidosComponent } from './agregar-logros-ypartidos.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule} from '@angular/forms';



@NgModule({
  declarations: [AgregarLogrosYPartidosComponent],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA], 
  exports:[AgregarLogrosYPartidosComponent]
})
export class AgregarLogrosYPartidosModule { }
