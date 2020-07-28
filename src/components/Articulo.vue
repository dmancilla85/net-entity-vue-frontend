<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="articulos"
        :search="search"
        loading-text="Cargando... Por favor espere"
        no-results-text="No hay coincidencias"
        :page.sync="page"
        :items-per-page="itemsPerPage"
        @page-count="pageCount = $event"
        sort-by="nombre"
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
          <td>{{ props.item.codigo }}</td>
          <td>{{ props.item.nombre }}</td>
          <td>{{ props.item.categoria }}</td>
          <td>{{ props.item.stock }}</td>
          <td>{{ props.item.precioVenta }}</td>
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
            <v-btn @click="crearPDF()"><v-icon>print</v-icon></v-btn>
            <v-toolbar-title>Artículos</v-toolbar-title>
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
                      <v-col cols="6" sm="6" md="4">
                        <v-text-field
                          v-model="obj.codigo"
                          label="Código"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" sm="6" md="4">
                        <v-select
                          v-model="obj.idCategoria"
                          :items="categorias"
                          label="Categoría"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-model="obj.nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" sm="6" md="4">
                        <v-text-field
                          type="number"
                          v-model="obj.stock"
                          label="Stock"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6" sm="6" md="4">
                        <v-text-field
                          type="number"
                          v-model="obj.precioVenta"
                          label="Precio de venta"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="4">
                        <v-text-field
                          v-bind="obj.descripcion"
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
import jsPDF from "jspdf";
import "jspdf-autotable";

export default {
  data() {
    return {
      page: 1,
      pageCount: 0,
      itemsPerPage: 10,
      configuracion: {
        headers: { Authorization: `Bearer ${this.$store.state.token}` }
      },
      articulos: [],

      dialog: false,
      headers: [
        { text: "Opciones", value: "opciones", sortable: false },
        { text: "Codigo", value: "codigo" },
        { text: "Nombre", value: "nombre" },
        { text: "Categoria", value: "categoria" },
        { text: "Stock", value: "stock" },
        { text: "Precio de venta", value: "precioVenta" },
        { text: "Descripción", value: "descripcion", sortable: false },
        { text: "Estado", value: "activo" }
      ],
      search: "",
      editedIndex: -1,
      obj: {
        id: "",
        idCategoria: "",
        codigo: "",
        stock: 0,
        precioVenta: 0,
        nombre: "",
        descripcion: ""
      },
      categorias: [],
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
      return this.editedIndex === -1 ? "Nuevo artículo" : "Actualizar artículo";
    }
  },

  watch: {
    dialog(val) {
      val || this.close();
    }
  },

  created() {
    this.listar();
    this.select();
  },
  methods: {
    editItem(item) {
      this.obj.id = item.idArticulo;
      this.obj.nombre = item.nombre;
      this.obj.descripcion = item.descripcion;
      this.obj.precioVenta = item.precioVenta;
      this.obj.codigo = item.codigo;
      this.obj.stock = item.stock;
      this.obj.idCategoria = item.idCategoria;
      this.editedIndex = 1;
      this.dialog = true;
    },

    deleteItem(item) {
      const index = this.articulos.indexOf(item);

      confirm("Are you sure you want to delete this item?") &&
        this.articulos.splice(index, 1);
    },

    close() {
      this.dialog = false;
      this.limpiar();
    },

    limpiar() {
      this.obj.id = "";
      this.obj.nombre = "";
      this.obj.idCategoria = "";
      this.obj.stock = 0;
      this.obj.codigo = "";
      this.obj.precioVenta = 0;
      this.obj.descripcion = "";
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
            "api/Articulos/Actualizar",
            {
              idArticulo: Number(me.obj.id),
              idCategoria: Number(me.obj.idCategoria),
              codigo: me.obj.codigo,
              nombre: me.obj.nombre,
              precioVenta: Number(me.obj.precioVenta),
              stock: Number(me.obj.stock),
              descripcion: me.obj.descripcion
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
        axios
          .post(
            "api/Articulos/Crear",
            {
              nombre: me.obj.nombre,
              descripcion: me.obj.descripcion,
              idCategoria: Number(me.obj.idCategoria),
              stock: Number(me.obj.stock),
              codigo: me.obj.codigo,
              precioVenta: Number(me.obj.precioVenta)
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
          "El nombre debe tener mas de 3 caracteres y mas de 50 caracteres."
        );
      }

      if (!me.obj.stock || me.obj.stock == 0) {
        me.validarMensaje.push("Ingrese el stock inicial del artículo.");
      }

      if (!me.obj.precioVenta || me.obj.precioVenta <= 0) {
        me.validarMensaje.push("Ingrese el precio de venta del artículo.");
      }

      if (!me.obj.idCategoria) {
        me.validarMensaje.push("Seleccione una categoría.");
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
      this.adId = item.idArticulo;

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
        .put("api/Articulos/Activar/" + this.adId, {})
        .then(function(response) {
          console.log(response);
          me.adModal = 0;
          (me.adAccion = 0), (me.adNombre = "");
          me.adId = "";
          me.listar();
        }, me.configuracion)
        .catch(function(error) {
          console.log(error);
        });
    },
    desactivar() {
      let me = this;
      console.log(me.adId);
      axios
        .put("api/Articulos/Desactivar/" + me.adId, {}, me.configuracion)
        .then(function(response) {
          console.log(response);
          me.adModal = 0;
          (me.adAccion = 0), (me.adNombre = "");
          me.adId = "";
          me.listar();
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    crearPDF() {
      var columns = [
        { title: "Nombre", dataKey: "nombre" },
        { title: "Código", dataKey: "codigo" },
        { title: "Categoría", dataKey: "categoria" },
        { title: "Stock", dataKey: "stock" },
        { title: "Precio venta", dataKey: "precioVenta" }
      ];
      var rows = [];
      this.articulos.map(function(x) {
        rows.push({
          nombre: x.nombre,
          codigo: x.codigo,
          categoria: x.categoria,
          stock: x.stock,
          precioVenta: x.precioVenta
        });
      });

      console.log(rows);

      var doc = new jsPDF("p", "pt");
      doc.autoTable(columns, rows, {
        margin: { top: 60 }
      });

      doc.save("Articulos.pdf");
    },
    listar() {
      let me = this;

      axios
        .get("api/Articulos/Listar", me.configuracion)
        .then(function(response) {
          console.log(response);
          me.articulos = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    },
    select() {
      let me = this;
      var categoriasArray = [];
      axios
        .get("api/Categorias/Select", me.configuracion)
        .then(function(response) {
          categoriasArray = response.data;
          categoriasArray.map(function(x) {
            me.categorias.push({ text: x.nombre, value: x.idCategoria });
          });
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>
