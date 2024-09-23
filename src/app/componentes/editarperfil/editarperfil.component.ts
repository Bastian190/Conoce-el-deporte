import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {
    

  constructor(private  navCtrl: NavController, private router: Router, public toastController:ToastController) { }
  // Método para navegar a la página
  irAPaginaDestino() {
    this.router.navigate(['/tabs/configuracion']);
  }
  ngOnInit() {}

}
