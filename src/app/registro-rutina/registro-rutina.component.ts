import { Component, OnInit } from '@angular/core';
import { NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { FirestoreService } from '../servicios/firestore.service';
import { Tipo_rutina, Rutinas} from '../modelos/equipos.models';
import { ChangeDetectorRef } from '@angular/core';
import { AuthService } from '../servicios/auth.service';
import { addDoc, collection, Firestore, serverTimestamp} from '@angular/fire/firestore';
@Component({
  selector: 'app-registro-rutina',
  templateUrl: './registro-rutina.component.html',
  styleUrls: ['./registro-rutina.component.scss'],
})
export class RegistroRutinaComponent  implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  rutina: Tipo_rutina[] = [];
  intensidad: string[]=[];
  Rutinas: Rutinas[]=[];
  rutinaSeleccionada: any = {};
  intensidadSeleccionada: string | null = null;
  result!:number;

  constructor(private  navCtrl: NavController, private router:Router, private firestoreService:FirestoreService,private cdr: ChangeDetectorRef, private toastController: ToastController, private authService: AuthService, private firestore: Firestore) {}


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
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      const usuarioId = currentUser.uid;
      
      if (usuarioId) {
        this.inicializarPuntajes(usuarioId); // Inicializa los puntajes si el usuario está autenticado
      }
    } else {
      console.error('No se encontró ningún usuario autenticado');
    }
  }
  async inicializarPuntajes(usuarioId: string) {
    try {
      // Crear la subcolección "puntajes" en el documento de usuario
      await addDoc(collection(this.firestore, `usuarios/${usuarioId}/puntajes`), {
        puntos: 0,
        fecha: serverTimestamp() // Usar serverTimestamp de Firestore
      });
      console.log('Puntajes inicializados en 0');
    } catch (error) {
      console.error('Error al inicializar los puntajes:', error);
    }
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
  cargarIntensidad() {
    this.firestoreService.getcolleccionChanges<Rutinas>('Rutinas').subscribe(data => {
      if (data && data.length > 0) {
        const intensidadDoc = data[0];
        this.intensidad = [intensidadDoc.facil, intensidadDoc.media, intensidadDoc.dificil];
        this.cdr.detectChanges();
      }
    });
  }
  
  onSelect(selectedValues: string[], dia: string) {
    this.rutinaSeleccionada[dia] = selectedValues;  // Almacenar la selección del usuario por día
    if (selectedValues.length < 1 || selectedValues.length > 2) {
      this.mostrarToast(`¡Debes seleccionar máximo dos rutinas para el día ${dia}!`, 'warning');
      this.result = 1;
    } else {
      this.result = 2;
    }
  }

  // Maneja la validación de la intensidad
  validacion(selectedValues: string[]) {
    this.intensidadSeleccionada = selectedValues[0];  // Asignar la intensidad seleccionada
    if (!this.intensidadSeleccionada) {
      this.mostrarToast('Debes seleccionar una opción de intensidad.', 'warning');
      this.result = 3;
    } else {
      this.result = 2;
    }
  }
  async guardarRutina() {
    const currentUser = this.authService.getCurrentUser(); // Obtener el usuario autenticado
  
    if (currentUser) {
      const uid = currentUser.uid; // Obtener el ID del usuario autenticado
      try {
        // Guardar la rutina y la intensidad seleccionadas en la subcolección del usuario
        await this.firestoreService.guardarRutina(uid, this.rutinaSeleccionada, this.intensidadSeleccionada);
        this.mostrarToast('Rutina guardada exitosamente.', 'success');
        this.router.navigate(['/tabs/Inicio']);
      } catch (error) {
        this.mostrarToast('Error al guardar la rutina.', 'danger');
        console.error('Error al guardar la rutina: ', error);
      }
    } else {
      this.mostrarToast('No hay un usuario autenticado.', 'warning');
    }
  }
  todos(){
    this.guardarRutina()
    this.inicio()
    
  }
  async mostrarToast(message: string, color: string = 'warning') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color
    });
    toast.present();
  }
}
