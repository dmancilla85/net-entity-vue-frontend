<template>
  <v-layout align-center justify-center>
    <v-flex xs12 sm8 md6 lg5 xl4>
      <v-card>
        <v-toolbar dark color="blue darken-3">
          <v-toolbar-title>
            Acceso al Sistema
          </v-toolbar-title>
        </v-toolbar>
        <v-card-text>
          <v-text-field
            v-model="email"
            autofocus
            color="accent"
            label="Email"
            required
          >
          </v-text-field>
          <v-text-field
            v-model="password"
            type="password"
            @keyup.enter="ingresar"
            color="accent"
            label="Password"
            required
          >
          </v-text-field>
          <v-flex class="red--text" v-if="error">
            {{ error }}
          </v-flex>
        </v-card-text>
        <v-card-actions class="px-3 pb-3">
          <v-flex text-xs-right>
            <v-btn :disabled="isLoading" @click="ingresar" color="primary"
              >Ingresar</v-btn
            >
          </v-flex>
        </v-card-actions>
      </v-card>
    </v-flex>
  </v-layout>
</template>
<script>
import axios from "axios";
export default {
  data() {
    return {
      email: "",
      password: "",
      error: null,
      isLoading: false
    };
  },
  methods: {
    async ingresar() {
      let me = this;
      me.isLoading = true;
      me.error = null;
      await axios
        .post("api/Usuarios/Login", {
          email: me.email,
          password: me.password
        })
        .then(respuesta => {
          return respuesta.data;
        })
        .then(data => {
          me.$store.dispatch("guardarToken", data.token);
          try {
            me.$router.push({ name: "home" });
          } catch (err) {
            throw new Error(`Problem handling something: ${err}.`);
          }
        })
        .catch(err => {
          //console.log(err.response);
          if (err.response.status == 400) {
            me.error = "No es un email válido";
          } else if (err.response.status == 404) {
            me.error = "No existe el usuario o sus datos son incorrectos";
          } else {
            me.error = "Ocurrió un error";
          }
          me.isLoading = false;
        });
    }
  }
};
</script>
