import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-tab1',
  templateUrl: 'Inicio.page.html',
  styleUrls: ['Inicio.page.scss']
})
export class Inicio {

  usuario: any;

  constructor(private activeroute: ActivatedRoute, private router: Router) { 
    // Nos suscribimos a los parámetros de la ruta
    this.activeroute.queryParams.subscribe(params => {
      // Verificamos si hay una navegación activa y si el estado contiene datos
      const navigation = this.router.getCurrentNavigation();
      if (navigation && navigation.extras.state) {
        this.usuario = navigation.extras.state['usuario'];
        console.log(this.usuario);
      } else {
        console.log('No hay navegación activa o no hay datos en el estado.');
      }
    });
  }

  ngOnInit() {
    // No es necesario hacer nada aquí si ya estamos manejando la navegación en el constructor
  }
}