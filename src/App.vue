<template>
  <div id="app">
    <div v-if='!webGLEnabled'>
      <div class='absolute no-webgl'>
        <h4>WebGL is not enabled :(</h4>
        <p>This website needs <a href='https://en.wikipedia.org/wiki/WebGL' class='highlighted'>WebGL</a> to render visualization.
        </p> <p>
        You can try another browser. If problem persists - very likely your video card isn't supported then.
        </p>
      </div>
    </div>
    <div class="controls-container" v-if='webGLEnabled'>
      <formula-editor :model="code" @toggle-settings="toggleSettings()"></formula-editor>
      <a
        href="#"
        class="help-title"
        @click.prevent='aboutVisible = !aboutVisible'
        title="click to learn more about this website"
      >what is this?</a>
      <div class="status-bar">
        <a
          class="generate-trigger"
          href="#"
          @click.prevent="toggleSettings()"
          title="Click here to toggle visualization settings"
        >{{settingsPanel.collapsed ? 'Show settings' : 'Hide settings' }}</a>
        <a
          class="generate-trigger"
          href="#"
          @click.prevent="generateNewFunction"
          title="Click here to generate a new random image"
        >Create new image</a>
      </div>

      <div class="settings" v-show="!settingsPanel.collapsed">
        <div class="block">
          <div class="title">Settings</div>

          <div class="row">
            <div class="col">Total steps</div>
            <div class="col">
              <input
                type="number"
                :step="stepsPerIterationDelta"
                v-model="totalSteps"
                @keyup.enter="onSubmit"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
            <help-icon @show="totalStepsHelp = !totalStepsHelp" :class="{open: totalStepsHelp}"></help-icon>
          </div>
          <div class="row help" v-if="totalStepsHelp">
            <div>
              <p>How many iterations should we make before stopping?</p>
            </div>
          </div>
          <div class="row">
            <div class="col">Steps per frame</div>
            <div class="col">
              <input
                type="number"
                :step="stepsPerIterationDelta"
                v-model="stepsPerIteration"
                @keyup.enter="onSubmit"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
            <help-icon
              @show="stepsPerIterationHelp = !stepsPerIterationHelp"
              :class="{open: stepsPerIterationHelp}"
            ></help-icon>
          </div>
          <div
            class="row help"
            v-if="stepsPerIterationHelp"
          >How many iterations do we make per single rendering frame?</div>
          <div class="row">
            <div class="col">Maximum lines</div>
            <div class="col">
              <input
                type="number"
                :step="bufferSizeDelta"
                v-model="bufferSize"
                @keyup.enter="onSubmit"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
            <help-icon @show="bufferSizeHelp = !bufferSizeHelp" :class="{open: bufferSizeHelp}"></help-icon>
          </div>
          <div
            class="row help"
            v-if="bufferSizeHelp"
          >How many lines are visible?</div>
          <div class="row">
            <div class="col">Line Color</div>
            <div class="col">
              <color-picker :color="lineColor" @changed="updateLineColor"></color-picker>
            </div>
          </div>
          <div class="row">
            <div class="col">Background color</div>
            <div class="col">
              <color-picker :color="fillColor" @changed="updateFillColor"></color-picker>
            </div>
          </div>

          <a href="#" @click.prevent='toggleSettings' class='close'>Close settings</a>
        </div>
      </div>
    </div>

    <about @close='aboutVisible = false' v-if='aboutVisible'></about>
    <a href="https://github.com/anvaka/e-sum" class="about-link">Source code</a>
  </div>
</template>

<script>
import { VueMathjax } from "vue-mathjax";
import FormulaEditor from "./components/FormulaEditor";
import ColorPicker from "./components/ColorPicker";
import About from "./components/About";
import HelpIcon from "./components/Icon";

var isSmallScreen = require("./lib/isSmallScreen");
var generateFunction = require("./lib/generate-function");
var appState = require("./lib/appState");
var bus = require("./bus");

export default {
  name: "App",
  components: {
    FormulaEditor,
    About,
    ColorPicker,
    HelpIcon,
    VueMathjax
  },
  mounted() {
    bus.on("progress", this.onProgress);
  },
  beforeDestroy() {
    bus.off("progress", this.onProgress);
  },
  data() {
    return {
      aboutVisible: false,
      webGLEnabled: appState.webGLEnabled,
      settingsPanel: appState.settingsPanel,
      code: appState.code,

      lineColor: appState.getLineColor(),
      fillColor: appState.getFillColor(),

      stepsPerIteration: appState.getStepsPerIteration(),
      stepsPerIterationHelp: false,

      totalSteps: appState.getTotalSteps(),
      totalStepsHelp: false,

      bufferSize: appState.getBufferSize(),
      bufferSizeHelp: false,

      current: 0,
      outOf: 0
    };
  },
  computed: {
    stepsPerIterationDelta() {
      return exponentialStep(this.stepsPerIteration);
    },
    totalStepsDelta() {
      return exponentialStep(this.totalSteps);
    },
    bufferSizeDelta() {
      return exponentialStep(this.bufferSize);
    }
  },
  watch: {
    stepsPerIteration(newValue) {
      appState.setStepsPerIteration(newValue);
    },
    totalSteps(newValue) {
      appState.setTotalSteps(newValue);
    },
    bufferSize(newValue) {
      appState.setBufferSize(newValue);
    }
  },
  methods: {
    onProgress(current, outOf) {
      this.current = current;
      this.outOf = outOf;
    },
    draw() {
      appState.redraw();
    },
    toggleSettings() {
      this.settingsPanel.collapsed = !this.settingsPanel.collapsed;
      this.aboutVisible = false;
      bus.fire("settings-collapsed", this.settingsPanel.collapsed);
    },
    generateNewFunction() {
      var settings = generateFunction();
      this.stepsPerIteration = settings.stepsPerIteration;
      this.totalSteps = settings.totalSteps;
      this.bufferSize = settings.bufferSize;
      this.updateLineColor(settings.color);
      appState.code.setCode(settings.code, true);
      appState.ignoreNextEditorChange();
    },
    onSubmit() {
      if (isSmallScreen()) {
        appState.settingsPanel.collapsed = true;
      }
      appState.redraw();
    },
    updateLineColor(c) {
      appState.setLineColor(c.r, c.g, c.b, c.a);
      this.lineColor = appState.getLineColor();
    },
    updateFillColor(c) {
      appState.setFillColor(c.r, c.g, c.b, c.a);
      this.fillColor = appState.getFillColor();
    }
  }
};

function exponentialStep(value) {
  var dt = Math.pow(10, Math.floor(Math.log10(value)));
  if (value - dt === 0) {
    // This is odd case when you are increasing number, but otherwise it's a good adjustment.
    return dt / 10;
  }
  return dt;
}
</script>

<style lang='stylus'>
@import './shared.styl';

status-color = #1B294A;

.no-webgl {
  width: 100%;
  color: hsla(215, 37%, 55%, 1);
  flex-direction: column; text-align: center;
  padding: 12px;
}
.no-webgl h4 {
  margin: 7px 0;
  font-size: 24px;
}

* {
  box-sizing: border-box;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}

a {
  color: primary-text;
}

.status-bar {
  font-size: 14px;
  color: secondary-text;
  background: window-background;
  display: flex;
  flex-direction: row;
  border-right: 1px solid secondary-border;
  border-bottom: 1px solid secondary-border;

  a.generate-trigger {
    font-size: 16px;
    padding: 8px;
    flex: 1;
    height: 42px;
    display: flex;
    align-self: stretch;
    align-items: center;
    justify-content: center;
    border-left: 1px solid secondary-border;

    &:hover {
      background-color: #174e9b;
      color: white;
    }
  }

  a.syntax-visible {
    background: status-color;
    color: white;
    font-style: normal;
  }
}
.absolute {
  position: absolute;
}

a.help-title {
  font-size: 14px;
  color: #267fcd;
  padding: 8px;
  font-style: italic;
  position: absolute;
  top: 8px;
  right: 0;
}

.help {
  background-color: status-color;
  color: secondary-text;
  padding: 8px;
  overflow: auto;
  max-height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.row.error {
  background-color: severe-error-background;
  color: primary-text;
}

.controls-container {
  z-index: 1;
  position: absolute;
  background-color: #061838;
  max-height: 100%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  width: 440px;
  border-left: none;
  border-top: none;
  flex-direction: column;
  display: flex;
}

a {
  text-decoration: none;
}

.settings {
  flex: 1;
  color: secondary-text;
  left: 0;
  overflow-y: auto;
  border: 1px solid secondary-border;
  background: window-background;
  width: 100%;
  padding: 7px 7px 7px 7px;
  top: 47px;

  a.help-title {
    float: right;
    font-size: 12px;
    font-style: italic;
    color: #267fcd;
    height: 30px;
    margin: -5px;
    padding: 7px;
  }
}

.settings.collapsed {
  display: none;
}

.title {
  margin-bottom: 7px;
  color: primary-text;
  font-size: 18px;
}

.row {
  display: flex;
  flex-direction: row;
}

.col {
  flex: 1;
}

.center {
  justify-content: center;
}

.block {
  .col {
    align-items: center;
    display: flex;
  }

  // .row {
  // margin-top: 4px;
  // }
  select {
    margin-left: 14px;
  }

  input[type='text'], input[type='number'] {
    background: transparent;
    color: primary-text;
    border: 1px solid transparent;
    padding: 7px;
    font-size: 16px;
    width: 100%;
    margin-left: 7px;

    &:focus {
      outline-offset: 0;
      outline: none;
      border: 1px dashed;
      background: #13294f;
    }

    &:invalid {
      box-shadow: none;
    }
  }
}

.reset {
  text-decoration: none;
  color: white;
  display: flex;
  justify-content: center;
}

.bounding-box {
  position: relative;

  .title {
    position: absolute;
    bottom: 0;
    font-size: 12px;
    left: 0;
    color: ternary-text;
  }

  .reset {
    font-size: 16px;
  }

  input[type='number'] {
    width: 100px;
    margin: 0;
    font-size: 12px;
    text-align: center;
    color: secondary-text;
  }

  input:invalid {
    box-shadow: none;
  }

  .max-x {
    justify-content: flex-end;
  }
}

a.about-link {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 42px;
  padding-left: 7px;
  display: flex;
  align-items: center;
}

@keyframes blink {
  from {
    background: rgba(10, 25, 54, 1);
  }

  to {
    background: rgba(24, 63, 154, 1);
  }
}

.controls {
  display: flex;
  flex-shrink: 0;
  height: control-bar-height;
  width: 100%;
  background-color: status-color;

  a {
    padding: 8px;
    display: flex;
    flex: 1;
    border-left: 1px solid secondary-border;
    justify-content: center;
    align-items: center;
  }

  a.dirty {
    background-color: rgba(24, 63, 154, 1);
    // animation: blink 1500ms ease-in-out infinite alternate;
  }

  a:first-child {
    border-left: 0;
  }

  a.share-btn {
    display: none;

    svg {
      fill: white;
    }
  }

  a.toggle-pause {
    flex: 0.3;
  }
}

pre.error {
  background: severe-error-background;
  color: #ffff;
  margin: 0px -8px;
  padding: 0 8px;
}

@media (max-width: small-screen) {
  a.about-link {
    bottom: 0;
  }

  .controls-container {
    width: 100%;
  }
}

@media print {
  #app {
    display: none;
  }
}
</style>