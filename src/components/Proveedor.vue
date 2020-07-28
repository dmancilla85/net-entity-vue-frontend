<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="proveedores"
        :search="search"
        no-results-text="No hay coincidencias"
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:item.opciones="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">edit</v-icon>
        </template>
        <template v-slot:items="props">
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.tipoDocumento }}</td>
          <td>{{ props.item.numeroDocumento }}</td>
          <td>{{ props.item.direccion }}</td>
          <td>{{ props.item.telefono }}</td>
          <td>{{ props.item.email }}</td>
        </template>
        <template v-slot:no-data>
          <v-btn color="primary" @click="listar">Resetear</v-btn>
        </template>
        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Proveedores</v-toolbar-title>
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
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="obj.nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-select
                          v-model="obj.tipoDocumento"
                          :items="documentos"
                          label="Tipo Documento"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="number"
                          v-model="obj.numeroDocumento"
                          label="Nro. Documento"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="obj.direccion"
                          label="Dirección"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="telefono"
                          v-model="obj.telefono"
                          label="Teléfono"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="email"
                          v-model="obj.email"
                          label="E-mail"
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
      proveedores: [],
      configuracion: {
        headers: { Authorization: `Bearer ${this.$store.state.token}` }
      },
      dialog: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Nombre", value: "nombre" },
        { text: "Tipo Persona", value: "tipoPersona" },
        { text: "Tipo Documento", value: "tipoDocumento" },
        { text: "Número Documento", value: "numeroDocumento", sortable: false },
        { text: "Dirección", value: "direccion", sortable: false },
        { text: "Teléfono", value: "telefono", sortable: false },
        { text: "E-mail", value: "email", sortable: false }
      ],
      search: "",
      editedIndex: -1,
      obj: {
        id: "",
        tipoPersona: "Proveedor",
        tipoDocumento: "",
        numeroDocumento: "",
        direccion: "",
        telefono: "",
        email: ""
      },
      documentos: ["DNI", "RUC", "Pasaporte", "Cédula"],
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
        ? "Nuevo proveedor"
        : "Actualizar proveedor";
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
      this.obj.id = item.idpersona;
      this.obj.tipoPersona = item.tipoPersona;
      this.obj.nombre = item.nombre;
      this.obj.direccion = item.direccion;
      this.obj.tipoDocumento = item.tipoDocumento;
      this.obj.numeroDocumento = item.numeroDocumento;
      this.obj.telefono = item.telefono;
      this.obj.email = item.email;
      this.editedIndex = 1;
      this.dialog = true;
    },

    close() {
      this.dialog = false;
      this.limpiar();
    },

    limpiar() {
      this.obj.id = "";
      this.obj.nombre = "";
      this.obj.direccion = "";
      this.obj.tipoDocumento = "";
      this.obj.numeroDocumento = "";
      this.obj.telefono = "";
      this.obj.email = "";
      this.editedIndex = -1;
    },

    guardar() {
      if (this.validar()) {
        return;
      }

      let me = this;
      console.log(me.obj);

      if (this.editedIndex > -1) {
        // codigo para editar

        axios
          .put(
            "api/Personas/Actualizar",
            {
              idpersona: Number(me.obj.id),
              nombre: me.obj.nombre,
              tipoPersona: me.obj.tipoPersona,
              direccion: me.obj.direccion,
              tipoDocumento: me.obj.tipoDocumento,
              numeroDocumento: me.obj.numeroDocumento,
              telefono: me.obj.telefono,
              email: me.obj.email
            },
            me.configuracion
          )
          .then(function(response) {
            console.log(response);
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
        console.log(me.obj);
        axios
          .post(
            "api/Personas/Crear",
            {
              tipoPersona: me.obj.tipoPersona,
              tipoDocumento: me.obj.tipoDocumento,
              numeroDocumento: me.obj.numeroDocumento,
              direccion: me.obj.direccion,
              telefono: me.obj.telefono,
              email: me.obj.email,
              nombre: me.obj.nombre
            },
            me.configuracion
          )
          .then(function(response) {
            console.log(response);
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
          "El nombre debe tener mas de 3 caracteres y menos de 50 caracteres."
        );
      }

      if (!me.obj.tipoDocumento) {
        me.validarMensaje.push("Seleccione un tipo de documento.");
      }

      if (!me.obj.email) {
        me.validarMensaje.push("Ingrese el e-mail del proveedor.");
      }

      if (me.validarMensaje.length) {
        me.valida = 1;
      }

      return me.valida;
    },
    listar() {
      let me = this;

      axios
        .get("api/Personas/ListarProveedores", me.configuracion)
        .then(function(response) {
          me.proveedores = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>
