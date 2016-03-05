# React + Redux + Routing Stack for 28kb

Just because your stack is awesome, doesn't mean it has to be fat.

This repo serves as a minimally viable example of how to combine the great ideas of React + Redux without compromising on your build size.

## Kilobytes as currency

My goal for this project is to treat kilobytes as a sort of currency.

> I'll give you React, Redux and a Routing Stack for just 28kb. What can you offer me?

Heavy frameworks aren't just slow for end users to download, they slow down our transpilers, they are harder to understand internally when the framework inevitably breaks, and they're typically more difficult to extend and make our own.

## Behind the Curtain

- React (via [Preact](https://github.com/developit/preact))
- Redux (via [Socrates](https://github.com/matthewmueller/socrates))
- Action Logging (via [Redux Logger](https://github.com/fcomb/redux-logger))
- Functional Routing (via [enroute](https://github.com/lapwinglabs/enroute) + [simple history middleware](https://github.com/matthewmueller/redux-routes))

## See for yourself

```
git clone https://github.com/matthewmueller/28kb-react-redux-routing
npm install
npm start
```

## Kudos

All the hard work here was done by [@developit](https://github.com/developit) for his work on [Preact](https://github.com/developit/preact) and [@gearon](https://github.com/gaearon) for his work on [redux](https://github.com/reactjs/redux). The "custom" modules you see above are just a small amount of UX grease on top of the great implementations.
