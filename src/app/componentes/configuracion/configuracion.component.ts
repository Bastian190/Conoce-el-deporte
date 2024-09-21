import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent  implements OnInit {

  constructor(private  navCtrl: NavController) { }
  goBack() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
    
    // O puedes navegar a una página específica
    // this.navCtrl.navigateBack('/pagina-especifica');
  }
  ngOnInit() {}

}
