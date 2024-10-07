import { Component } from '@angular/core';
import { FirestoreService } from '../servicios/firestore.service';
import { Equipos } from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'buscar',
  templateUrl: 'Buscar.page.html',
  styleUrls: ['Buscar.page.scss']
})
export class Buscar {
  equipos: Equipos[] = [];
  equiposFiltrados: Equipos[] = [];

  constructor(private firestoreService:FirestoreService,private cdr: ChangeDetectorRef) { this.loadequipos();}

  loadequipos() {
    // Carga los equipos desde Firestore
    this.firestoreService.getcolleccionChanges<Equipos>('Equipos').subscribe(data => {
      if (data) {
        this.equipos = data;
        this.equiposFiltrados = [...this.equipos];
        this.cdr.detectChanges();
      }
    });
  }
  buscarEquipo(event: any) {
    const valorBusqueda = event.detail.value ? event.detail.value.toLowerCase() : '';  

    console.log('Valor de búsqueda:', valorBusqueda);  

    setTimeout(() => {
      if (!valorBusqueda || valorBusqueda.trim() === '') {
        this.equiposFiltrados = [...this.equipos];
      } else {
        this.equiposFiltrados = this.equipos.filter(equipo => {
          return equipo.nombre_fantasia.toLowerCase().includes(valorBusqueda) ||
                 equipo.tipo_deporte.toLowerCase().includes(valorBusqueda);
        });
      }
      this.cdr.detectChanges();  
    }, 0);
  }
}
