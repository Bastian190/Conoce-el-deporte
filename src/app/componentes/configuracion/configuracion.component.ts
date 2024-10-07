import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { EditarrutinaComponent } from '../editarrutina/editarrutina.component';
import { EditarperfilComponent } from '../editarperfil/editarperfil.component';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private modalController: ModalController,private router:Router) { }
  irAPaginaDestino() {
    console.log("entra")
    this.router.navigate(['/tabs/perfil']);
  }
  
  presentModal() {
    console.log("entra")
    this.router.navigate(['/tabs/editar-perfil']);
  }
  rutina() {
    console.log("entra")
    this.router.navigate(['/tabs/editarrutina']);
  }
  login() {
    console.log("entra")
    this.router.navigate(['/login']);
  }
  ngOnInit() {}

}
