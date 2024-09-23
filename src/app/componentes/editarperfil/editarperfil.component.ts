import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
@Component({
  selector: 'app-editarperfil',
  templateUrl: './editarperfil.component.html',
  styleUrls: ['./editarperfil.component.scss'],
})
export class EditarperfilComponent  implements OnInit {
  usuario!: string ;
  password!: string;
  result!: number;
  constructor(private  navCtrl: NavController, private alertController: AlertController, public toastController:ToastController, private router:Router) { }
  Atras() {
    // Navegar hacia la página anterior
    this.navCtrl.back();
    
  }
  siguiente(){
    if(this.result==1 || this.result==2){
      this.router.navigate(['/login'])
    }else if(this.result==3){
      this.router.navigate(['/tabs/Inicio'])
    }  
  }
  ngOnInit() {}
  validar(user: string, pasword: string){
    if(user ==null ){
      console.log("1")
      this.presentAlert()
      return this.result=1;
      
    }else if (pasword==null) {
      console.log("2")
      this.presentAlert()
      return this.result=2;
    } else {
      console.log("3")
      return this.result=3;
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
  
}
