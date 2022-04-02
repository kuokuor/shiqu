<template>
  <loading v-if="true" />
</template>

<script>
import Loading from '../../components/Loading.vue'

export default {
  name: 'Home',
  components: {
    Loading
  },
  setup () {
    return {}
  }
}
</script>
