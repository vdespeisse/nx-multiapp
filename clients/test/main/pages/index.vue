<template lang="pug">
div
  Logo
  h1.title Main
  a(v-for="app in apps" :href="'/' + app.name" :key="app.name") {{ app.name }}
</template>
<script>
import apps from '../static/_apps.json'
export default {
  data() {
    return {
      apps,
    }
  },
  // async mounted() {
  //   const apps = await this.$content('_apps.json').fetch()
  //   this.apps = apps
  // }
}
</script>
