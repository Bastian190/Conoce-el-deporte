import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; 
@Component({
  selector: 'app-equipo',
  templateUrl: './equipo.component.html',
  styleUrls: ['./equipo.component.scss'],
})
export class EquipoComponent  implements OnInit {
  alertButtons = ['aceptar'];
  
  constructor(private router: Router) { }

  // Método para navegar a la página
  irAPaginaDestino() {
    this.router.navigate(['/tabs/Buscar']);
  }
  ngOnInit() {}
  public alertInputs = [
    {
      label: 'Solo actividades',
      type: 'radio',
      value: 'actividades',
    },
    {
      label: 'Solo partidos',
      type: 'radio',
      value: 'partidos',
    },
    {
      label: 'Ambos',
      type: 'radio',
      value: 'todos',
    },
  ];
}
