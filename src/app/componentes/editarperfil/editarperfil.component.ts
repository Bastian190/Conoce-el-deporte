import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {

  constructor(private  navCtrl: NavController) { }
  Atras() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
    
  }
  ngOnInit() {}

}
