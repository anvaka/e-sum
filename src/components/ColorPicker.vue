<template>
  <div class="color-container" ref="root">
    <input
      type="text"
      @click.prevent="showPicker"
      :value="modelValue"
      readonly
      class="color-label"
    />
    <div
      class="picker"
      @click="hidePicker"
      v-if="opened"
      ref="pickerOverlay"
    >
      <chrome-color-picker
        @update:model-value="updateValue" 
        v-model="colorValue"
        :style="getPickerStyle()"
      ></chrome-color-picker>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { Sketch } from "@lk77/vue3-color";

export default defineComponent({
  name: "ColorPicker",
  components: {
    "chrome-color-picker": Sketch,
  },
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  setup(props, { emit }) {
    const opened = ref(false);
    const pickerOverlay = ref(null);
    const root = ref(null);
    const colorValue = ref(props.modelValue);

    const showPicker = () => {
      opened.value = true;
    };

    const hidePicker = (e) => {
      if (e.target === pickerOverlay.value) {
        opened.value = false;
      }
    };

    const getPickerStyle = () => {
      const rect = root.value?.getBoundingClientRect() || {
        left: 0,
        top: 0,
      };
      return {
        position: "absolute",
        left: rect.left - 30 + "px",
        top: rect.top - 179 + "px",
      };
    };

    return {
      colorValue,
      opened,
      pickerOverlay,
      root,
      showPicker,
      hidePicker,
      getPickerStyle,
      updateValue(value) {
        colorValue.value = value;
        emit('changed', value.rgba)
      }
    };
  },
});
</script>

<style lang="stylus">
.color-container {
  width: 100%;
}
.picker {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
}
input[type="text"].color-label {
  cursor: pointer;
  font-size: 12px;
}
</style>
