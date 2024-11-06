import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { AlertController } from '@ionic/angular';
@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.scss'],
})
export class RecuperarComponent  implements OnInit {
  email: string = '';

  constructor(private router:Router, private alertController: AlertController) { }
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['login']);
  }

  ngOnInit() {}
  async sendPasswordResetEmail() {
    if (!this.email) {
      await this.showAlert('Error', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, this.email);
      await this.showAlert(
        'Correo enviado',
        'Se ha enviado un correo de recuperación a tu dirección de correo electrónico. Sigue las instrucciones para restablecer tu contraseña.'
      );
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        await this.showAlert(
          'Error',
          'No se encontró una cuenta asociada a este correo. Verifica que el correo sea correcto e intenta nuevamente.'
        );
      } else {
        console.error('Error al enviar correo de recuperación:', error);
        await this.showAlert(
          'Error',
          'Ocurrió un problema al enviar el correo de recuperación. Intenta de nuevo más tarde.'
        );
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}