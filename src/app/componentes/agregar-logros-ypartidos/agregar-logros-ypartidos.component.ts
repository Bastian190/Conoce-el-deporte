import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { addDoc, collection, collectionData, doc, Firestore, getDoc } from '@angular/fire/firestore';
import { AuthService } from 'src/app/servicios/auth.service';

@Component({
  selector: 'app-agregar-logros-ypartidos',
  templateUrl: './agregar-logros-ypartidos.component.html',
  styleUrls: ['./agregar-logros-ypartidos.component.scss'],
})
export class AgregarLogrosYPartidosComponent  implements OnInit {
  campoSeleccionado!: string;
  nuevoLogro!: string;
  fechaLogro!: string; // Usa el tipo adecuado, como Date o string según tus necesidades
  nuevoPartidoContrincante!: string;
  nuevoPartidoUbicacion!: string;
  resultadoPartido!: string;
  fechaPartido!: string; // Usa el tipo adecuado, como Date o string según tus necesidades
  equipoId!: string;
  equipos: any[] = [];
  equipoSeleccionado: any = {};
  equipoSeleccionadoId: string | null = null;
  constructor(private router: Router, private firestore: Firestore, private authService: AuthService) { }

  ngOnInit() {
    this.obtenerEquiposAdministrados();
  }
  irAPaginaDestino() {
    this.router.navigate(['/tabs/perfil']);
  }
  mostrarToast(mensaje: string, color: string) {
    console.log(mensaje); // Esto es solo un ejemplo, puedes reemplazarlo
  }
  async obtenerEquiposAdministrados() {
    const currentUser = this.authService.getCurrentUser();
  
    if (!currentUser) {
      this.mostrarToast('Debes iniciar sesión para ver tu rutina.', 'warning');
      return; // Salir si no hay usuario
    }
  
    const adminCollection = collection(this.firestore, `usuarios/${currentUser.uid}/administracion`);
  
    // Suscribirse a los datos de la colección de administración
    collectionData(adminCollection, { idField: 'id' }).subscribe({
      next: async (administracion) => {
        this.equipos = []; // Limpiar la lista de equipos antes de cargar nuevos datos
        
        // Recorremos cada documento de administración
        for (const docAdmin of administracion) {
          const equipoRef = docAdmin['id_equipo'];
  
          // Asegúrate de que 'equipoRef' sea una referencia válida
          if (equipoRef && equipoRef.id) {
            const equipoId = equipoRef.id; // Obtén el ID de la referencia
            console.log(`Buscando equipo con ID: ${equipoId}`); // Log para depuración
  
            const equipoDocRef = doc(this.firestore, `Equipos/${equipoId}`);
            const equipoDoc = await getDoc(equipoDocRef);
  
            if (equipoDoc.exists()) {
              const equipoData = equipoDoc.data();
              console.log(`Datos del equipo obtenidos: `, equipoData); // Log los datos del equipo para depuración
  
              // Asegúrate de que equipoData sea un objeto antes de usar el operador spread
              if (equipoData) {
                this.equipos.push({ id: equipoDoc.id, ...equipoData }); // Agregamos el equipo a la lista
                console.log(`Equipo encontrado: ${equipoData['nombre_fantasia']}`); // Log para confirmar el equipo
              } else {
                console.error("Los datos del equipo son nulos o indefinidos.");
              }
            } else {
              console.error(`El documento del equipo con ID ${equipoId} no existe.`); // Log de error
            }
          } else {
            console.error("El ID del equipo es inválido.");
          }
        }
  
        console.log('Equipos administrados: ', this.equipos); // Para verificar que se están cargando correctamente
      },
      error: (error) => {
        console.error("Error al obtener equipos: ", error);
        this.mostrarToast('Ocurrió un error al obtener los equipos.', 'danger');
      }
    });
  }
  
  
  seleccionarEquipo(equipo: any) {
    if (this.equipoSeleccionadoId === equipo.id) {
      // Si ya está seleccionado, lo deseleccionamos
      this.equipoSeleccionadoId = null;
      this.equipoSeleccionado = null;
    } else {
      // Seleccionamos el nuevo equipo
      this.equipoSeleccionadoId = equipo.id;
      this.equipoSeleccionado = equipo;
    }
    console.log('Equipo seleccionado:', this.equipoSeleccionado); // Para verificar en la consola
  }
  
  
  async agregarDato() {
    if (!this.equipoSeleccionado) {
      this.mostrarToast('Por favor, selecciona un equipo antes de agregar datos.', 'warning');
      return; // Salir si no hay equipo seleccionado
    }
  
    const equipoId = this.equipoSeleccionado.id; // Obtén el ID del equipo seleccionado
  
    if (this.campoSeleccionado === 'Logros') {
      const logrosRef = collection(this.firestore, `Equipos/${equipoId}/Logros`);
  
      try {
        await addDoc(logrosRef, {
          logro: this.nuevoLogro,
          fecha: this.fechaLogro, // Asegúrate de que esto esté en el formato correcto
        });
        console.log("Logro agregado exitosamente.");
        // Resetea los campos después de agregar
        this.nuevoLogro = '';
        this.fechaLogro = '';
      } catch (error) {
        console.error("Error al agregar logro: ", error);
      }
    } else if (this.campoSeleccionado === 'Partidos') {
      const partidosRef = collection(this.firestore, `Equipos/${equipoId}/Partidos`);
  
      try {
        await addDoc(partidosRef, {
          contrincante: this.nuevoPartidoContrincante,
          ubicacion: this.nuevoPartidoUbicacion,
          resultado: this.resultadoPartido,
          fecha: this.fechaPartido, // Asegúrate de que esto esté en el formato correcto
        });
        console.log("Partido agregado exitosamente.");
        // Resetea los campos después de agregar
        this.nuevoPartidoContrincante = '';
        this.nuevoPartidoUbicacion = '';
        this.resultadoPartido = '';
        this.fechaPartido = '';
      } catch (error) {
        console.error("Error al agregar partido: ", error);
      }
    }
  }
}
