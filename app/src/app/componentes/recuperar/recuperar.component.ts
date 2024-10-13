import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.component.html',
  styleUrls: ['./recuperar.component.scss'],
})
export class RecuperarComponent  implements OnInit {

  constructor(private router:Router) { }
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['login']);
  }

  ngOnInit() {}

}
