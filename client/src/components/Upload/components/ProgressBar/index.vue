<style lang="scss" module>
  .progress {
    width: 100%;
    height: 20px;
    max-height: 20px;
    padding: 4px;
    align-self: flex-end;
    background: rgba(0, 0, 0, 0.45);
    border-radius: 4px;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.45),
                0 1px rgba(255, 255, 255, 0.08);
  }
  .bar {
    position: relative;
    height: 100%;
    width: 0;
    border-radius: 4px;
    transition: width .5s ease-out;
    box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.45),
                inset 0 1px rgba(255, 255, 255, 0.1);
    background: linear-gradient(#2d9dd7, #1c81c7);

    &::before,
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }
    &::before {
      bottom: 0;
      border-radius: 4px 4px 0 0;
    }
    &::after {
      z-index: 2;
      bottom: 45%;
      border-radius: 4px;
    }
  }
</style>
<template>
  <div class="progress">
    <div class="bar" :style="{ width: width + '%'}"></div>
  </div>
</template>
<script>
export default {
  name: 'ProgressBar',
  props: { width: { type: Number, default: 0 }}
};
</script>
