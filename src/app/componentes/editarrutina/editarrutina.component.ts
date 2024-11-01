import { Component, OnInit } from '@angular/core';
import { AlertController, NavController, ToastController } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { Tipo_rutina } from 'src/app/modelos/equipos.models';
import { FirestoreService } from '../../servicios/firestore.service';
import { AuthService } from 'src/app/servicios/auth.service';
import { collection, doc, Firestore, getDoc, getDocs, updateDoc } from '@angular/fire/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Component({
  selector: 'app-editarrutina',
  templateUrl: './editarrutina.component.html',
  styleUrls: ['./editarrutina.component.scss'],
})
export class EditarrutinaComponent implements OnInit {
  diasDeLaSemana: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  rutina: Tipo_rutina[] = [];
  result!: number;
  todasLasRutinas: { [key: string]: any[] } = { disponibles: [] }; // Inicializar aquí
 // Objeto para almacenar todas las rutinas
 rutinaSeleccionada: string | null = null;
diaSeleccionado!: string;
tiposDeRutinasPermitidos: string[] = ['abdomen', 'hombro', 'pierna', 'brazo', 'pecho'];
  constructor(private  navCtrl: NavController, private router:Router, private firestoreService:FirestoreService,private toastController: ToastController, private authService: AuthService, private firestore: Firestore, private alertController: AlertController ) { }
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
    console.log("Cargando todas las rutinas...");
    this.cargarRutinas()
    this.verificarAutenticacion();
  }

  seleccionarRutina(rutina: string) {
    this.rutinaSeleccionada = rutina;
    console.log(this.rutinaSeleccionada)// Cambia la rutina seleccionada
  }
  async cargarRutinas() {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
        console.warn('Debes iniciar sesión para ver tus rutinas.');
        return;
    }

    try {
        // Obtener rutinas disponibles
        const tipoRutinaCollection = collection(this.firestore, 'Rutinas/PlyuiOZ5ex4zKxUcZGTO/Tipo_rutina');
        const tipoRutinaSnapshot = await getDocs(tipoRutinaCollection);
        const todasRutinasDesdeTipo = tipoRutinaSnapshot.docs.map(doc => doc.data()['nombre_tipo_rutina']);

        // Obtener rutinas del usuario
        const rutinasCollection = collection(this.firestore, `usuarios/${currentUser.uid}/rutinas`);
        const rutinasSnapshot = await getDocs(rutinasCollection);

        // Crear un conjunto de rutinas asignadas
        const rutinasAsignadas = new Set<string>();
        rutinasSnapshot.forEach(doc => {
            const data = doc.data();
            this.diasDeLaSemana.forEach(dia => {
                const rutinasDelDia = data[dia] || [];
                rutinasDelDia.forEach((rutina: string) => {
                    rutinasAsignadas.add(rutina); // Agregar rutina al conjunto
                });
            });
        });

        // Filtrar las rutinas disponibles
        const rutinasFiltradas = todasRutinasDesdeTipo
            .filter(rutina => !rutinasAsignadas.has(rutina)) // Filtrar rutinas ya asignadas
            .filter(rutina => this.tiposDeRutinasPermitidos.includes(rutina)); // Filtrar por tipos permitidos

        // Eliminar duplicados (por nombre) y limitar a 5
        this.todasLasRutinas['disponibles'] = Array.from(new Set(rutinasFiltradas)).slice(0, 5);

        // Imprimir el resultado para depuración
        console.log('Rutinas disponibles:', this.todasLasRutinas['disponibles']);

    } catch (error) {
        console.error('Error al cargar las rutinas:', error);
    }
}

verificarAutenticacion() {
  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Usuario autenticado, carga los objetivos
      this.cargarRutinas();
    } else {
      // Usuario no autenticado, redirige a inicio de sesión
      this.authService.signOut(); // Cierra la sesión si es necesario
      // Aquí puedes redirigir al usuario a la página de login
    }
  });
}

async actualizarRutina(diaSeleccionado: string | null, rutinaSeleccionada: string | null) {
  if (!diaSeleccionado || !rutinaSeleccionada) {
    console.warn('Día o rutina seleccionada no válidos.');
    return;
  }

  try {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.warn('Debes iniciar sesión para actualizar la rutina.');
      return;
    }

    const rutinaRef = doc(this.firestore, `usuarios/${currentUser.uid}/rutinas/rutina_semanal`);
    const docSnap = await getDoc(rutinaRef);
    
    if (!docSnap.exists()) {
      console.error(`No existe el documento rutina_semanal para el usuario: ${currentUser.uid}`);
      return;
    }

    const rutinasActuales = docSnap.data();
    const rutinasDelUsuario = rutinasActuales['rutina'];

    // Verifica si hay rutinas para el día seleccionado
    if (!rutinasDelUsuario[diaSeleccionado]) {
      console.error(`No hay rutina para el día: ${diaSeleccionado}`);
      return;
    }

    // Reemplaza la rutina para el día seleccionado con la nueva rutina
    rutinasDelUsuario[diaSeleccionado] = [rutinaSeleccionada];

    // Actualiza el array de rutinas para el día seleccionado en Firestore
    await updateDoc(rutinaRef, {
      [`rutina.${diaSeleccionado}`]: rutinasDelUsuario[diaSeleccionado] // Reemplaza la rutina del día seleccionado
    });

    console.log('Rutina actualizada correctamente');
    this.mostrarAlerta('Alerta','La rutina ha sido actualizada correctamente.')
  } catch (error) {
    console.error('Error al actualizar la rutina:', error);
    this.mostrarAlerta('Alerta','La rutina no ha sido actualizada correctamente.')
  }
}







// Función de ejemplo para obtener los ejercicios
obtenerEjercicios(rutinaSeleccionada: string) {
  // Aquí deberías implementar la lógica para obtener los ejercicios basados en la rutina seleccionada.
  return [
    {
      nombre_tipo_rutina: rutinaSeleccionada, // Asegúrate de que este campo esté correctamente definido
      // Agrega otros campos necesarios aquí, por ejemplo:
      // repeticiones: 10, series: 3, etc.
    }
  ];
}

  
  


  onSelect(dia: string) {
    this.diaSeleccionado = dia;
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
  async mostrarAlerta(header: string, message: string, buttons: string[] = ['OK']) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons,
    });
    await alert.present();
  }
  
}
