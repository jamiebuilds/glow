<img src="https://raw.githubusercontent.com/thejameskyle/glow/master/logo.jpg" alt="Glow logo"/>

# Glow

> Make your Flow errors GLOW

* Pretty-printed, code highlighted type errors
* Interactive watch mode
* Filter through errors using globs

## Installation

```sh
# globally
yarn global add glow
# or in your project
yarn add --dev glow
```

<a href="https://twitter.com/thejameskyle/status/958591823789940736">
  <img src="https://raw.githubusercontent.com/thejameskyle/glow/master/video.jpg" alt="Preview"/>
</a>

## Usage

In your existing Flow project, instead of running:

```sh
flow
```

Simply run:

```sh
glow
```

You can also filter errors down to a specific set of files by running:

```sh
glow path/to/whatever
```

There's even an awesome watch mode:

```sh
glow --watch
```
