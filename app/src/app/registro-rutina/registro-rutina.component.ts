<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import { Tipo_rutina, Rutinas} from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';
=======
import { NavController } from '@ionic/angular';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import { Tipo_rutina } from '../modelos/equipos.models'; 
>>>>>>> origin/bastian

@Component({
  selector: 'app-registro-rutina',
  templateUrl: './registro-rutina.component.html',
  styleUrls: ['./registro-rutina.component.scss'],
})
<<<<<<< HEAD
export class RegistroRutinaComponent  implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
=======
export class RegistroRutinaComponent implements OnInit {

>>>>>>> origin/bastian
  rutina: Tipo_rutina[] = [];
  intensidad: string[]=[];
  Rutinas: Rutinas[]=[];
  result!:number;

<<<<<<< HEAD
  constructor(private  navCtrl: NavController, private router:Router, private firestoreService:FirestoreService,private cdr: ChangeDetectorRef, private toastController: ToastController) {}


  inicio() {
    console.log("entra")
    if(this.result==1 || this.result==3){
      
      return
    }else if(this.result==2){
      this.router.navigate(['/tabs/Inicio'])
    }
    
  }
  
  ngOnInit() {
    this.cargarRutinas();
    this.cargarIntensidad();
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
  cargarIntensidad(){

    this.firestoreService.getcolleccionChanges<Rutinas>('Rutinas').subscribe(data => {
      if (data && data.length > 0) {
        console.log('Datos recibidos:', data);
        // Asumiendo que data tiene los campos de intensidad facil, media, dificil
        const intensidadDoc = data[0]; // Tomando el primer documento o ajusta según la lógica
        this.intensidad = [
          intensidadDoc.facil,
          intensidadDoc.media,
          intensidadDoc.dificil
        ];
        console.log('Intensidades:', this.intensidad);
        this.cdr.detectChanges();  // Para que Angular detecte cambios en la vista
      }
    });
  }
  
  onSelect(selectedValues: string[], dia: string) {
    this.mostrarToast(`Seleccionaste ${selectedValues.length} opciones para ${dia}`,'success');
     if (selectedValues.length < 1 || selectedValues.length > 2) {
      selectedValues.pop();
      this.mostrarToast(`¡Debes seleccionar máximo dos rutinas para él día ${dia}!.`);
      return this.result=1;
    }else{
      return this.result=2;
    }
  }
  validacion(selectedValues: string[]){
    if(!selectedValues ||selectedValues.length===0){
      this.mostrarToast(`Debes seleccionar una opcion.`);
      return this.result=3;
    }else{
      return this.result=2;
    }
  }
  async mostrarToast(message: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
=======
  constructor(
    private navCtrl: NavController,
    private router: Router,
    private firestoreService: FirestoreService,
    private cdr: ChangeDetectorRef
  ) {}

  inicio() {
    console.log("entra");
    this.router.navigate(['/tabs/Inicio']);
  }

  ngOnInit() {
    // Cargar rutinas de la subcolección al inicializar el componente
    this.cargarRutinas();
  }

  cargarRutinas() {
    // Reemplaza 'coleccionPrincipal', 'documento', y 'subcoleccion' con los valores correctos
    const coleccionPrincipal = 'Rutinas'; // Cambia por el nombre de tu colección
    const documento = 'PlyuiOZ5ex4zKxUcZGTO'; // Cambia por el ID del documento
    const subcoleccion = 'Tipo_rutina'; // Cambia por el nombre de la subcolección

    this.firestoreService.getSubdocumentos<Tipo_rutina>(coleccionPrincipal, documento, subcoleccion).subscribe(data => {
      this.rutina = data;
      console.log("Rutinas cargadas:", this.rutina);
      this.cdr.detectChanges(); // Llama a detectChanges si es necesario
    });
>>>>>>> origin/bastian
  }
}
