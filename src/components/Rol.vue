<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="roles"
        :search="search"
        loading-text="Buscando..."
        no-results-text="No hay coincidencias"
        sort-by="nombre"
        class="elevation-1"
      >
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
            <v-toolbar-title>Roles</v-toolbar-title>
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
      roles: [],
      configuracion: {
        headers: { Authorization: `Bearer ${this.$store.state.token}` }
      },
      dialog: false,
      headers: [
        { text: "Nombre", value: "nombre" },
        { text: "Descripción", value: "descripcion", sortable: false },
        { text: "Estado", value: "activo" }
      ],
      search: ""
    };
  },
  computed: {},

  watch: {},

  created() {
    this.listar();
  },
  methods: {
    listar() {
      let me = this;

      axios
        .get("api/Roles/Listar", me.configuracion)
        .then(function(response) {
          console.log(response);
          me.roles = response.data;
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
};
</script>
