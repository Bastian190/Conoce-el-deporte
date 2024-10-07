import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import { Tipo_rutina} from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-registro-rutina',
  templateUrl: './registro-rutina.component.html',
  styleUrls: ['./registro-rutina.component.scss'],
})
export class RegistroRutinaComponent  implements OnInit {

  rutina: Tipo_rutina[] = [];

  constructor(private  navCtrl: NavController, private router:Router, private firestoreService:FirestoreService,private cdr: ChangeDetectorRef) {
    this.loadrutinas();}


  inicio() {
    console.log("entra")
    this.router.navigate(['/tabs/Inicio']);
  }
  
  ngOnInit() {}


  loadrutinas(){
    this.firestoreService.getcolleccionChanges<Tipo_rutina>('Rutina').subscribe(data => {
      if (data) {
        this.rutina = data
      }
    });
  }

}
