import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../servicios/auth.service'; // Asegúrate de que el path es correcto

@Component({
  selector: 'app-sesion-usuario',
  templateUrl: './sesion-usuario.page.html',
  styleUrls: ['./sesion-usuario.page.scss'],
})
export class SesionUsuarioPage implements OnInit {
  usuario!: string;
  password!: string;
  result!: number;

  constructor(
    private alertController: AlertController,
    public toastController: ToastController,
    private router: Router,
    private authService: AuthService // Inyectar el servicio
  ) {}

  ngOnInit() {}

  validar(user: string, pasword: string) {
    if (user == null) {
      this.presentAlert();
      return (this.result = 1);
    } else if (pasword == null) {
      this.presentAlert();
      return (this.result = 2);
    } else {
      return (this.result = 3);
    }
  }

  todos() {
    this.validar(this.usuario, this.password);
    this.validarCorreo(this.usuario);

    if (this.result === 3) {
      this.authService.signIn(this.usuario, this.password).then(() => {
        let navigationExtras: NavigationExtras = {
          state: { usuario: this.usuario }
        };
        this.router.navigate(['/tabs/Inicio'], navigationExtras);
      }).catch(err => {
        this.presentAlert(); // Aquí puedes manejar el error y mostrar un mensaje
      });
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'El usuario o contraseña no es correcto',
      buttons: ['OK'],
    });
    await alert.present();
  }

  validarCorreo(user: string): number {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (user.length === 0) {
      this.correoAlert();
      return 3;
    } else if (!emailPattern.test(user)) {
      this.correo2Alert();
      return 4;
    } else {
      return 5;
    }
  }

  async correoAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Debe escribir un correo.',
      buttons: ['OK'],
    });
    await alert.present();
  }

  async correo2Alert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'El correo no está bien escrito.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}
