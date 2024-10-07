import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent  implements OnInit {
  registroForm!: FormGroup;
  constructor(private fb: FormBuilder, private  navCtrl: NavController, private router:Router, private toastController: ToastController, private alertController: AlertController){}
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['login']);
  }
  registrorutina() {
    console.log("entra")
    this.router.navigate(['registroRutina']);
  }
  ngOnInit(): void {
    this.registroForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required]],
      altura:['', [Validators.min((0))]],
      peso:['',[Validators.min((0))]],
      correo:['',[Validators.required, Validators.email]],
      date: ['', [Validators.required]],
      sex: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      passwordRepeat: ['', [Validators.required]]
    });
  }
  async registrar() {
    console.log(this.registroForm.value); 

    if (this.registroForm.invalid) {
      this.mostrarToast('Por favor, rellena todos los campos obligatorios correctamente.');
      return;
    }

    const { password, passwordRepeat } = this.registroForm.value;
    if (password !== passwordRepeat) {
      this.mostrarToast('Las contraseñas no coinciden');
      return;
    }
    
    


    if (this.registroForm.valid){
      this.mostrarToast('Registro exitoso', 'success');
      this.registrorutina()
    }
    
    
  }

  async mostrarToast(message: string, color: string = 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
