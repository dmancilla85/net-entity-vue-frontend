<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="categorias"
        :search="search"
        sort-by="nombre"
        loading-text="Cargando.."
        no-results-text="No hay coincidencias"
        class="elevation-1"
      >
        <template v-slot:item.opciones="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
          <template v-if="item.activo">
            <v-icon small @click="activarDesactivarMostrar(2, item)"
              >block</v-icon
            >
          </template>
          <template v-else>
            <v-icon small @click="activarDesactivarMostrar(1, item)"
              >check</v-icon
            >
          </template>
        </template>
        <template v-slot:items="props">
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.descripcion }}</td>
        </template>
        <template v-slot:item.activo="{ item }">
          <div v-if="item.activo">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Inactivo</span>
          </div>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listar">Resetear</v-btn>
        </template>
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Categorías</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              append-icon="search"
              label="Búsqueda"
              single-line
              hide-details
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on }">
                <v-btn color="primary" dark class="mb-2" v-on="on">Nuevo</v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="obj.nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="obj.descripcion"
                          label="Descripción"
                        ></v-text-field>
                      </v-col>
                      <v-flex xs12 sm12 md12 v-show="valida">
                        <div
                          class="red--text"
                          v-for="v in validarMensaje"
                          :key="v"
                          v-text="v"
                        ></div>
                      </v-flex>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancelar</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="guardar"
                    >Guardar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="adModal" max-width="290x">
              <v-card>
                <v-card-title class="headline" v-if="adAccion == 1"
                  >¿Activar Item?</v-card-title
                >
                <v-card-title class="headline" v-if="adAccion == 2"
                  >¿Desactivar Item?</v-card-title
                >
                <v-card-text>
                  Estás a punto de
                  <span v-if="adAccion == 1">activar</span>
                  <span v-if="adAccion == 2">desactivar</span>
                  el ítem {{ adNombre }}
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" @click="activarDesactivarCerrar"
                    >Cancelar</v-btn
                  >
                  <v-btn
                    v-if="adAccion == 1"
                    color="orange darken-4"
                    @click="activar"
                    >Activar</v-btn
                  >
                  <v-btn
                    v-if="adAccion == 2"
                    color="orange darken-4"
                    @click="desactivar"
                    >Desactivar</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      categorias: [],
      configuracion: {
        headers: { Authorization: `Bearer ${this.$store.state.token}` }
      },

      dialog: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Nombre", value: "nombre" },
        { text: "Descripción", value: "descripcion", sortable: false },
        { text: "Estado", value: "activo" }
      ],
      search: "",
      editedIndex: -1,
      obj: {
        id: "",
        nombre: "",
        descripcion: ""
      },
      valida: 0,
      validarMensaje: [],
      adModal: 0,
      adAccion: 0,
      adNombre: "",
      adId: ""
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? "Nueva categoría"
        : "Actualizar categoría";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.listar();
  },
  methods: {
    editItem(item) {
      this.obj.id = item.idCategoria;
      this.obj.nombre = item.nombre;
      this.obj.descripcion = item.descripcion;
      this.editedIndex = 1;
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.categorias.indexOf(item);
      confirm("Are you sure you want to delete this item?") &&
        this.categorias.splice(index, 1);
    },

    close() {
      this.dialog = false;
      this.limpiar();
    },

    limpiar() {
      this.obj.id = "";
      this.obj.nombre = "";
      this.obj.descripcion = "";
      this.editedIndex = -1;
    },

    guardar() {
      if (this.validar()) {
        return;
      }

      if (this.editedIndex > -1) {
        // codigo para editar
        let me = this;
        axios
          .put(
            "api/Categorias/Actualizar",
            {
              idCategoria: me.obj.id,
              nombre: me.obj.nombre,
              descripcion: me.obj.descripcion
            },
            me.configuracion
          )
          .then(function() {
            //console.log(response);
            me.close();
            me.listar();
            me.limpiar();
          })
          .catch(function(error) {
            console.log(error);
          });
      } else {
        // codigo para guardar
        let me = this;
        axios
          .post(
            "api/Categorias/Crear",
            {
              nombre: me.obj.nombre,
              descripcion: me.obj.descripcion
            },
            me.configuracion
          )
          .then(function() {
            //console.log(response);
            me.close();
            me.listar();
            me.limpiar();
          })
          .catch(function(error) {
            console.log(error);
          });
      }
    },

    validar() {
      let me = this;
      me.valida = 0;
      me.validarMensaje = [];

      if (me.obj.nombre.length < 3 || me.obj.nombre.length > 50) {
        me.validarMensaje.push(
          "El nombre debe tener mas de 3 caracteres y mas de 50 caracteres"
        );
      }

      if (me.validarMensaje.length) {
        me.valida = 1;
      }

      return me.valida;
    },
    activarDesactivarCerrar() {
      this.adModal = 0;
    },
    activarDesactivarMostrar(accion, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this.adId = item.idCategoria;

      if (accion == 1) {
        this.adAccion = 1;
      } else if (accion == 2) {
        this.adAccion = 2;
      } else {
        this.adModal = 0;
      }
    },
    activar() {
      let me = this;

      axios
        .put("api/Categorias/Activar/" + this.adId, {}, me.configuracion)
        .then(function() {
          //console.log(response);
          me.adModal = 0;
          (me.adAccion = 0), (me.adNombre = "");
          me.adId = "";
          me.listar();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    desactivar() {
      let me = this;
      console.log(me.adId);
      axios
        .put("api/Categorias/Desactivar/" + me.adId, {}, me.configuracion)
        .then(function() {
          //console.log(response);
          me.adModal = 0;
          (me.adAccion = 0), (me.adNombre = "");
          me.adId = "";
          me.listar();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    listar() {
      let me = this;
      axios
        .get("api/Categorias/Listar", me.configuracion)
        .then(function(response) {
          //console.log(response);
          me.categorias = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>
