<template>
    <div class="error-log">
      <h5>Errors:</h5>
      <ul>
        <li v-for="(error, index) in errors" :key="'error-'+index">{{ error }}</li>
      </ul>
      <h5>Warnings:</h5>
      <ul>
        <li v-for="(warning, index) in warnings" :key="'warning-'+index">{{ warning }}</li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ErrorLog',
    props: {
      errors: Array,
      warnings: Array
    }
  }
  </script>