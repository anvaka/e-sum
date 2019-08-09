# e-sum

This is an "art" project to visualize exponential sums.

![demo](https://i.imgur.com/Wv9CaCS.png)

Just keep clicking "Create new Image" until you find something pretty. Then share it
with the world if you like it (copy link to the page - it includes the formula)

A few examples that I found pretty:

* [Animated logo](http://anvaka.github.io/e-sum/?code=x%2F38%20%2B%20cos%28x*61.258%29&bufferSize=30000&totalSteps=30000000&spi=500)

## What is going on here?

An exponential sum is the following expression:

![Exponential sum](https://i.imgur.com/9nc4ZAS.png)

When we translate it to complex plane we get both `x` and `y` coordinates:

```
x = cos(2 π f(x))
y = sin(2 π f(x))
````

Sequence of partial sums is plotted as sequence of connected points by this visualization.

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