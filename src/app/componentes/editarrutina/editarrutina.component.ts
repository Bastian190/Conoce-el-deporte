import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-editarrutina',
  templateUrl: './editarrutina.component.html',
  styleUrls: ['./editarrutina.component.scss'],
})
export class EditarrutinaComponent  implements OnInit {

  constructor(private  navCtrl: NavController) { }
  goBack() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
    
  }
  

  ngOnInit() {}

}
