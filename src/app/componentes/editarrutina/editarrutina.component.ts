import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-editarrutina',
  templateUrl: './editarrutina.component.html',
  styleUrls: ['./editarrutina.component.scss'],
})
export class EditarrutinaComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private router:Router) { }
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['/tabs/configuracion']);
  }
  
  ngOnInit() {}

}
