// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import {createApp} from 'vue'
import App from './App.vue'
import VueMathjax from 'vue-mathjax-next'

if (window.MathJax) {
  window.MathJax.Hub.Config({
    tex2jax: {
      inlineMath: [['$', '$']],
      displayMath: [['$$', '$$'], ['[', ']']],
      processEscapes: true,
      processEnvironments: true
    },
    // Center justify equations in code and markdown cells. Elsewhere
    // we use CSS to left justify single line equations in code cells.
    displayAlign: 'center',
    'HTML-CSS': {
      styles: { '.MathJax_Display': { margin: 0 } },
      linebreaks: { automatic: true }
    }
  })
  window.MathJax.Hub.Queue([
    'Typeset',
    window.MathJax.Hub,
    document.body
  ])
}

const app = createApp(App);
app.use(VueMathjax);
app.mount('#app');