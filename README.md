# e-sum

Art project to visualize complex exponential sums. [Demo](https://anvaka.github.io/e-sum/?code=x%2F8%20%2B%205*cos%28x*101.824%29%20&bufferSize=12000&totalSteps=300000&spi=500).

![demo](https://i.imgur.com/Wv9CaCS.png)


To create an interesting pattern, click "Create new Image" until you like it. It may take a few attempts
before you stumble upon something pretty with intricate patterns.

![demo](https://i.imgur.com/sl1SPM7.gif)

I couldn't come up with better rules to generate nice looking patterns more consistently, so if you have
suggestions - please let me know.

When you find something you like copy a link to the page - and share it :). A few examples that I found pretty:

* [Animated logo](https://anvaka.github.io/e-sum/?code=x%2F38%20%2B%20cos%28x*61.258%29&bufferSize=30000&totalSteps=30000000&spi=500)
* [Waves](https://anvaka.github.io/e-sum/?code=x%2F22%20%2B%20cos%28x*78.091%29%20&bufferSize=12000&totalSteps=300000&spi=500)
* [Stars](https://anvaka.github.io/e-sum/?code=x%2F5%20%2B%20cos%28x*1%2FPI*22%29%2B%20sin%28x*64%2FPI*2%29&bufferSize=90000&totalSteps=3000000&spi=5000)
* [Particles](https://anvaka.github.io/e-sum/?code=x%2F8%20%2B%205*cos%28x*101.824%29%20&bufferSize=12000&totalSteps=300000&spi=500)
* [Dog](https://anvaka.github.io/e-sum/?code=x%20%2B%20x%20*%20x%20*%20x%20%2F35&bufferSize=12000&totalSteps=3000&spi=500)
* [Batman](https://anvaka.github.io/e-sum/?code=x%2F25%20%2B%20x*x*x%2F100&bufferSize=12000&totalSteps=12000&spi=500)

## What is going on here?

An exponential sum is the following expression:

![Exponential sum](https://i.imgur.com/9nc4ZAS.png)

When we translate it to complex plane we get both `x` and `y` coordinates:

```
x = cos(2 π f(x))
y = sin(2 π f(x))
````

Sequence of partial sums is plotted as sequence of connected points by this visualization.

## Known issues

If you see your visualization "runs away" - likely you are running into floating point rounding errors.
To avoid the errors - reduce the `Total steps` value in the visualization settings, so that summation
stops earlier.

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

# Thank you!

The project was inspired by a small [conversation on Twitter](https://twitter.com/germanrosm/status/1148836857314250752).

If you liked it please let me know. Give it a star, or [become a patron](https://www.patreon.com/anvaka).

I hope you find it amusing :).

## License

MIT