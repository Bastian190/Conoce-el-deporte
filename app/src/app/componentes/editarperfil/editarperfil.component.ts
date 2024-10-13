import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {
  correo: string = '';   // Declaración de las variables
  peso!: number;
  altura!: number ;
  password: string = '';
  password2: string = '';
  result: number=0;
  constructor( private cdr: ChangeDetectorRef, private route: ActivatedRoute, private  navCtrl: NavController, private alertController: AlertController, public toastController:ToastController, private router:Router) {
      }
  Atras() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
  }
  irAPaginaDestino() {
    console.log("entra")
    this.router.navigate(['/tabs/configuracion']);
    
  }
  siguiente(){
    if (this.result !== 5){
      console.log('no entra')
      this.router.navigate(['/tabs/editar-perfil'])
    }else{
      console.log('entra 1')
      this.Atras()
    }  
  }
  ngOnInit() {}


  validar( pasword: string, pasword2: string,  weight: number, height: number): number {
    
    console.log('entra2')
    if (!pasword || !pasword2) {
      console.log('Las contraseñas son requeridas');
      this.passwordAlert();
      return 2;
    } else if (pasword != pasword2) {
      console.log('2')
      console.log(pasword, pasword2)
      this.passwordAlert()
      return 2;
    } else if (weight === null || height === null || weight <= 0 || height <= 0) {
      console.log('Peso o altura inválido');
      return 1;
    } else {
      console.log('5')
      return 5;
    }
  }
  validarCorreo(email: string): number{
    console.log(email)
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (email.length === 0) {
      console.log('3')
      this.correoAlert()
      return  3;

    } else if (!emailPattern.test(email)) {
      console.log('4')
      this.correo2Alert()
      return 4;
    }else{
      return 5;
    }
  }
  async passwordAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Las contraseñas no son iguales.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  async correctdAlert() {
    const alert = await this.alertController.create({
      header: 'Alerta',
      message: 'Se han guardado los cambios.',
      buttons: ['OK'],
    });
  
    await alert.present();
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
      message: 'El correo no esta bien escrito.',
      buttons: ['OK'],
    });
  
    await alert.present();
  }
  
  todosperfil(event: Event) {
    event.preventDefault();
    

    this.result = this.validarCorreo(this.correo);
    console.log('Resultado de validación de correo:', this.result);

    if (this.result === 5) {
      this.result = this.validar(
        this.password,
        this.password2,
        this.peso,
        this.altura
      );
    }
    this.cdr.detectChanges(); 
    this.siguiente();
  }
}
