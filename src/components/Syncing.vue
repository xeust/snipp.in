<template>
  <div class="syncer">
    <div v-if="syncing" class="yellow">Syncing with Deta</div>
    <div v-else class="green">Synced with Deta</div>
  </div>
</template>


<script>
export default {
  computed: {
    syncing: function () {
      return this.$store.state.isSyncing;
    },
  },
};
</script>

<style lang="scss" scoped>
.syncer {
  display: flex;
  align-items: center;
  height: 30px;
  padding-left: 16px;
  font-family: Menlo, Monaco, "Courier New", monospace;
}

.yellow {
  color: #eecb30;
}

.green {
  color: #27da6b;
}
</style>
