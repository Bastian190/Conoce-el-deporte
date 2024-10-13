import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { Tipo_rutina } from 'src/app/modelos/equipos.models';
import { FirestoreService } from '../../servicios/firestore.service';
@Component({
  selector: 'app-editarrutina',
  templateUrl: './editarrutina.component.html',
  styleUrls: ['./editarrutina.component.scss'],
})
export class EditarrutinaComponent implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  rutina: Tipo_rutina[] = [];
  result!: number;
  constructor(private  navCtrl: NavController, private router:Router, private firestoreService:FirestoreService,private toastController: ToastController) { }
  irAPaginaDestino1() {
    console.log("entra")
    this.router.navigate(['/tabs/configuracion']);
  }
  inicio() {
    console.log("entra")
    if(this.result==1 || this.result==3){
      
      return
    }else if(this.result==2){
      this.router.navigate(['/tabs/Inicio'])
    }
    
  }
  
  ngOnInit() {
    this.cargarRutinas()
  }

  cargarRutinas() {

    const coleccionPrincipal = 'Rutinas'; // Cambia por el nombre de tu colección
    const documento = 'PlyuiOZ5ex4zKxUcZGTO'; // Cambia por el ID del documento
    const subcoleccion = 'Tipo_rutina'; // Cambia por el nombre de la subcolección

    this.firestoreService.getSubdocumentos<Tipo_rutina>(coleccionPrincipal, documento, subcoleccion).subscribe((rutinas: Tipo_rutina[]) => {
      const tiposUnicos = new Set<string>(); 
      this.rutina = rutinas.filter(rutina =>{
        const tipo = rutina.nombre_tipo_rutina?.toLowerCase(); // Convertir a minúsculas
      // Agregar al Set solo si es uno de los tipos deseados y aún no está en el Set
      if (tipo && ['brazo', 'pierna', 'abdomen', 'pecho'].includes(tipo) && !tiposUnicos.has(tipo)) {
        tiposUnicos.add(tipo); // Agregar al Set
        return true; // Mantener en la lista filtrada
      }
      return false; // Excluir de la lista filtrada
    });
  });

  }
  onSelect(dia: string[]) {
    this.mostrarToast(`Seleccionaste ${dia}`,'success');
     if (!dia ||dia.length===0) {
      this.mostrarToast(`Debes seleccionar un día.`);
      return this.result=1;
    }else{
      return this.result=2;
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
