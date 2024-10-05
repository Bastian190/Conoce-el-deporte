import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private router:Router){}
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['login']);
  }
  ngOnInit() {}

}
