import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { EditarrutinaComponent } from '../editarrutina/editarrutina.component';
import { EditarperfilComponent } from '../editarperfil/editarperfil.component';
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private modalController: ModalController) { }
  goBack() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
    
  }
  async presentModal() {
    const modal = await this.modalController.create({
      component: EditarperfilComponent,
    });
    return await modal.present();
  }
  async rutina() {
    const modal = await this.modalController.create({
      component: EditarrutinaComponent,
    });
    return await modal.present();
  }
  ngOnInit() {}

}
