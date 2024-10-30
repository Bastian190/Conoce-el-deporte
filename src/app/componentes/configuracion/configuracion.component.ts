import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { EditarrutinaComponent } from '../editarrutina/editarrutina.component';
import { EditarperfilComponent } from '../editarperfil/editarperfil.component';
import { NavigationExtras, Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service'; // Asegúrate de que la ruta es correcta

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
})
export class ConfiguracionComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private modalController: ModalController,private router:Router,private authService: AuthService,private toastController: ToastController) { }
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
  cerrarSesion() {
    this.authService.signOut();
    this.presentToast() // Llama al método de cierre de sesión
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Sesión cerrada.',
      duration: 2000,
      position: 'bottom',
    });
    await toast.present();
  }
  
  ngOnInit() {}

}
