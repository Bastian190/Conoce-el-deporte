import { Component } from '@angular/core';
import { FirestoreService } from '../servicios/firestore.service';
import { Equipos } from '../modelos/equipos.models';

@Component({
  selector: 'buscar',
  templateUrl: 'Buscar.page.html',
  styleUrls: ['Buscar.page.scss']
})
export class Buscar {
  equipos: Equipos[] = [];

  constructor(private firestoreService:FirestoreService) { this.loadequipos();}
  loadequipos(){
    this.firestoreService.getcolleccionChanges<Equipos>('Equipos').subscribe(data => {
      if (data) {
        this.equipos = data
      }
    });
  }
  
  

}
