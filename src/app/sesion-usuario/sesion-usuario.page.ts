import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RouterLinkDelegateDirective } from '@ionic/angular/directives/navigation/router-link-delegate';
@Component({
  selector: 'app-sesion-usuario',
  templateUrl: './sesion-usuario.page.html',
  styleUrls: ['./sesion-usuario.page.scss'],
})
export class SesionUsuarioPage implements OnInit {
  usuario!: string ;
  password!: string;
  result!: number;
  constructor(private alertController: AlertController, public toastController:ToastController, private router:Router) { }
  siguiente(){
    let navigationExtras: NavigationExtras={
      state:{usuario:this.usuario}
    }
    if(this.result==1 || this.result==2){
      this.router.navigate(['/login'])
    }else if(this.result==3){
      this.router.navigate(['/tabs/Inicio'], navigationExtras)
    }

    
  }
  ngOnInit() {
  }
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
  

  todos(){
    this.validar(this.usuario, this.password)
    this.siguiente()
  }  
}
