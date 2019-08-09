<template>
  <div class='formula-editor'>
  <div class='editor-row'>
    <div class='formula math'>𝑓(x) = </div>
    <div class='input-container'>
      <div class='syntax math offset' v-html='codeHighlight' ref='syntax'></div>
      <input class='math offset' type="text" v-model='model.code' ref='editor' @keydown.capture="handleKeyDown" @keyup="syncScroll"> 
    </div>
  </div>
    <div class='error-container'>
      <pre v-if='model.error' class='error hl'>{{model.error}}</pre>
    </div> 
  </div>
</template>
<script>
export default {
  props: ['model'],
  computed: {
    codeHighlight() {
      const code = this.model.code;
      let rules = [{
        pattern: /[0-9]+(\.[0-9]+)?/g,
        className: 'number'
      }, {
        pattern: /[\(\)]/g,
        className: 'bracket'
      }]
      return rules.reduce(evaluateRule, code);
    }
  },
  methods: {
    syncScroll() {
      let {editor, syntax} = this.$refs;
      if (!editor || !syntax) return;

      syntax.scrollLeft = editor.scrollLeft;
    },
    handleKeyDown(e) {
      this.syncScroll();
      let direction = 0;
      if (e.keyCode === 38) { // arrow up
        direction = 1;
      } else if (e.keyCode === 40) {
        direction = -1; // arrow down
      }
      if (direction) {
        e.preventDefault();
        let {value, selectionStart} = this.$refs.editor;
        let result = queryNumberAndCursor(value, selectionStart)
        if (result) {
          const prefix = value.substring(0, result.from);
          const suffix = value.substring(result.to + 1);
          const newCode = (prefix + (result.number + direction) + suffix)
          this.model.setCode(newCode);
          this.$nextTick(() => {
            setCaretPosition(this.$refs.editor, selectionStart);
          })
        }
      }
    }
  },

  watch: {
    'model.code': function() {
      if (this.pendingSetCode) {
        clearTimeout(this.pendingSetCode);
      }
      this.syncScroll();

      // We don't want to update code on each key stroke. This would have negative
      // impact on performance.
      this.pendingSetCode = setTimeout(() => {
        this.model.setCode(this.model.code, true);
        this.pendingSetCode = 0;
      }, 300);
    },
  }
}
function evaluateRule(code, rule) {
  return code.replace(rule.pattern, match => `<span class=${rule.className}>${match}</span>`);
}

function queryNumberAndCursor(value, from) {
  return (getNumber(value, from) || getNumber(value, from - 1));
}

function getNumber(string, at) {
  if (!string || at < 0 || string.length < at) return;
  if (!isDigitOrDot(string[at])) return;
  let from = at;
  while (isDigitOrDot(string[from - 1])) from -= 1;

  let to = at;
  while (isDigitOrDot(string[to + 1])) to += 1;

  return {
    from, 
    to, 
    number: Number.parseFloat(string.substring(from, to + 1)),
  }
}

function isDigitOrDot(ch) {
  return ch && ch.match(/[0-9.]/);
}

function setCaretPosition(elem, caretPos) {
  if(elem === null) {
    return;
  }
  if(elem.createTextRange) {
      var range = elem.createTextRange();
      range.move('character', caretPos);
      range.select();
  }
  else {
      if(elem.selectionStart) {
          elem.focus();
          elem.setSelectionRange(caretPos, caretPos);
      }
      else
          elem.focus();
  }
}

</script>

<style lang="stylus">

@import '../shared.styl';

left-padding = 58px;

.formula-editor {
  border: 1px solid secondary-border;
  padding-right: 94px;
}

.editor-row {
  width: 100%;
  display: flex;
  color: white;
  font-size: 18px;
  height: 48px;
  align-items: center;

  .formula {
    left: 8px;
    position: absolute;
    pointer-events: none;
  }

  .math {
    font-family: MJXc-TeX-math-I,MJXc-TeX-math-Ix,MJXc-TeX-math-Iw;
  }

  .input-container {
    flex: 1;
    align-self: stretch;
    position: relative;
    font-size: 18px;
    .syntax {
      padding-left: left-padding+1px;
      white-space:pre;
      overflow: hidden;
      display: flex;
      align-items: center;
      .number {
        color: #f99157;
      }
      .bracket {
        color: gray;
      }
    }
  }

  .offset {
    top: 0;
    left: 0px;
    width: 100%;
    height: 100%;
    position: absolute;
  }

  input {
    font-family: MJXc-TeX-math-I,MJXc-TeX-math-Ix,MJXc-TeX-math-Iw;
    font-size: 18px;
    caret-color: primary-text;
    background: transparent;
    color: transparent;
    border: 1px solid transparent;
    padding-left: left-padding;

    &:focus {
      outline-offset: 0;
      outline: none;
      border: 1px dashed;
    }
    &:invalid {
      box-shadow:none;
    }
  }
}
  .error {
    white-space: normal;
  }
</style>
