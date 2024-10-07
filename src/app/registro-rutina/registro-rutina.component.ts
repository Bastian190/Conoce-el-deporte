import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-registro-rutina',
  templateUrl: './registro-rutina.component.html',
  styleUrls: ['./registro-rutina.component.scss'],
})
export class RegistroRutinaComponent  implements OnInit {

  constructor(private  navCtrl: NavController, private router:Router) { }
  inicio() {
    console.log("entra")
    this.router.navigate(['/tabs/Inicio']);
  }
  ngOnInit() {}

}
