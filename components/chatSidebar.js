// chatSidebar.js - Componente de sidebar con historial de conversaciones
app.component("chat-sidebar", {
  template: /*html*/ `
  <div class="chat-sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    
    <!-- Header del sidebar -->
    <div class="sidebar-header">
      <button @click="nuevaConversacion" class="btn-nueva-conversacion" title="Nueva conversación">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
        </svg>
        <span v-if="!collapsed">Nueva conversación</span>
      </button>
      
      <button @click="toggleCollapse" class="btn-toggle" title="Colapsar/Expandir">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                :d="collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'">
          </path>
        </svg>
      </button>
    </div>

    <!-- Lista de conversaciones -->
    <div class="conversaciones-lista" v-if="!collapsed">
      
      <!-- Loading -->
      <div v-if="cargando" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando historial...</p>
      </div>

      <!-- Sin conversaciones -->
      <div v-else-if="conversaciones.length === 0" class="sin-conversaciones">
        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
          </path>
        </svg>
        <p>No hay conversaciones previas</p>
        <small>Inicia una nueva conversación</small>
      </div>

      <!-- Lista de conversaciones -->
      <div v-else class="conversaciones-scroll">
        <div v-for="conv in conversaciones" 
             :key="conv.id" 
             class="conversacion-item"
             :class="{ 'activa': conv.id === conversacionActiva }"
             @click="seleccionarConversacion(conv.id)">
          
          <div class="conversacion-content">
            <h4 class="conversacion-titulo">{{ conv.titulo }}</h4>
            <p class="conversacion-preview" v-if="conv.ultimo_mensaje">
              {{ truncarTexto(limpiarHTML(conv.ultimo_mensaje), 60) }}
            </p>
            <div class="conversacion-meta">
              <span class="fecha">{{ formatearFecha(conv.fecha_actualizacion) }}</span>
              <span class="mensajes-count">{{ conv.total_mensajes }} msg</span>
            </div>
          </div>

          <div class="conversacion-acciones">
            <!-- Renombrar -->
            <button @click.stop="editarTitulo(conv)" 
                    class="btn-accion" 
                    title="Renombrar"
                    v-if="esAdministrador">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z">
                </path>
              </svg>
            </button>

            <!-- Exportar (solo Admin) -->
            <button @click.stop="mostrarMenuExportar(conv.id)" 
                    class="btn-accion" 
                    title="Exportar"
                    v-if="esAdministrador">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4">
                </path>
              </svg>
            </button>

            <!-- Eliminar -->
            <button @click.stop="eliminarConversacion(conv.id)" 
                    class="btn-accion btn-eliminar" 
                    title="Eliminar">
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                </path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Versión colapsada - solo iconos -->
    <div v-else class="conversaciones-iconos">
      <div v-for="conv in conversaciones.slice(0, 10)" 
           :key="conv.id"
           class="icono-conversacion"
           :class="{ 'activa': conv.id === conversacionActiva }"
           @click="seleccionarConversacion(conv.id)"
           :title="conv.titulo">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z">
          </path>
        </svg>
      </div>
    </div>

    <!-- Modal de exportación -->
    <div v-if="menuExportarVisible" class="modal-overlay" @click="cerrarMenuExportar">
      <div class="modal-exportar" @click.stop>
        <h3>Exportar conversación</h3>
        <p>Selecciona el formato de exportación:</p>
        
        <div class="opciones-exportar">
          <button @click="exportar('json')" class="btn-exportar">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            JSON
          </button>

          <button @click="exportar('txt')" class="btn-exportar">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
              </path>
            </svg>
            TXT
          </button>

          <button @click="exportar('pdf')" class="btn-exportar">
            <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z">
              </path>
            </svg>
            PDF
          </button>
        </div>

        <button @click="cerrarMenuExportar" class="btn-cancelar">Cancelar</button>
      </div>
    </div>
  </div>
  `,

  props: {
    usuarioEmail: {
      type: String,
      required: true
    },
    rolUsuario: {
      type: String,
      default: 'Usuario'
    }
  },

  data() {
    return {
      conversaciones: [],
      conversacionActiva: null,
      cargando: false,
      collapsed: false,
      menuExportarVisible: false,
      conversacionParaExportar: null
    };
  },

  computed: {
    esAdministrador() {
      return this.rolUsuario === 'Administrador';
    }
  },

  methods: {
    async cargarConversaciones() {
      this.cargando = true;
      
      try {
        const respuesta = await fetch(
          `../wecIA2/conversaciones/conversaciones.app?action=listar&usuario_email=${encodeURIComponent(this.usuarioEmail)}`
        );
        
        if (!respuesta.ok) {
          throw new Error('Error al cargar conversaciones');
        }
        
        const data = await respuesta.json();
        this.conversaciones = data.conversaciones || [];
        
      } catch (error) {
        console.error('Error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar las conversaciones',
          confirmButtonColor: '#10a37f'
        });
      } finally {
        this.cargando = false;
      }
    },

    nuevaConversacion() {
      this.conversacionActiva = null;
      this.$emit('nueva-conversacion');
    },

    seleccionarConversacion(id) {
      this.conversacionActiva = id;
      this.$emit('seleccionar-conversacion', id);
    },

    async editarTitulo(conversacion) {
      const { value: nuevoTitulo } = await Swal.fire({
        title: 'Renombrar conversación',
        input: 'text',
        inputValue: conversacion.titulo,
        inputPlaceholder: 'Escribe el nuevo título',
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#10a37f',
        inputValidator: (value) => {
          if (!value) {
            return 'El título no puede estar vacío';
          }
        }
      });

      if (nuevoTitulo) {
        try {
          const respuesta = await fetch('../wecIA2/conversaciones/conversaciones.app?action=actualizar', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: conversacion.id,
              titulo: nuevoTitulo
            })
          });

          if (!respuesta.ok) {
            throw new Error('Error al actualizar');
          }

          await this.cargarConversaciones();
          
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Título actualizado correctamente',
            timer: 2000,
            showConfirmButton: false
          });

        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el título',
            confirmButtonColor: '#10a37f'
          });
        }
      }
    },

    async eliminarConversacion(id) {
      const resultado = await Swal.fire({
        title: '¿Eliminar conversación?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6e6e80'
      });

      if (resultado.isConfirmed) {
        try {
          const respuesta = await fetch(
            `../wecIA2/conversaciones/conversaciones.app?action=eliminar&id=${id}`,
            { method: 'DELETE' }
          );

          if (!respuesta.ok) {
            throw new Error('Error al eliminar');
          }

          if (this.conversacionActiva === id) {
            this.conversacionActiva = null;
            this.$emit('conversacion-eliminada');
          }

          await this.cargarConversaciones();

          Swal.fire({
            icon: 'success',
            title: 'Eliminada',
            text: 'Conversación eliminada correctamente',
            timer: 2000,
            showConfirmButton: false
          });

        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar la conversación',
            confirmButtonColor: '#10a37f'
          });
        }
      }
    },

    mostrarMenuExportar(id) {
      this.conversacionParaExportar = id;
      this.menuExportarVisible = true;
    },

    cerrarMenuExportar() {
      this.menuExportarVisible = false;
      this.conversacionParaExportar = null;
    },

    async exportar(formato) {
      const url = `../wecIA2/exportar/exportar.app?formato=${formato}&conversacion_id=${this.conversacionParaExportar}&rol_usuario=${encodeURIComponent(this.rolUsuario)}`;
      
      window.open(url, '_blank');
      
      this.cerrarMenuExportar();
      
      Swal.fire({
        icon: 'success',
        title: 'Exportando',
        text: 'La descarga comenzará en breve',
        timer: 2000,
        showConfirmButton: false
      });
    },

    toggleCollapse() {
      this.collapsed = !this.collapsed;
    },

    truncarTexto(texto, maxLength) {
      if (!texto) return '';
      return texto.length > maxLength ? texto.substring(0, maxLength) + '...' : texto;
    },

    limpiarHTML(html) {
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || '';
    },

    formatearFecha(fecha) {
      const date = new Date(fecha);
      const ahora = new Date();
      const diff = ahora - date;
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias === 0) return 'Hoy';
      if (dias === 1) return 'Ayer';
      if (dias < 7) return `Hace ${dias} días`;
      
      return date.toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short' 
      });
    }
  },

  mounted() {
    this.cargarConversaciones();
    
    // Actualizar lista cada 30 segundos
    this.interval = setInterval(() => {
      this.cargarConversaciones();
    }, 30000);
  },

  beforeUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }
});
