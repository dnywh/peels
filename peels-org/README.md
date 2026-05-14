# Peels.org Phase 1

This is the temporary static identity page for `peels.org`.

Phase 1 exists to make `peels.org` a stable, legitimate, low-risk domain while
the working Peels app remains at [peels.app](https://peels.app). This site does
not dual-host the app and does not redirect `peels.app`.

## Run locally

```sh
npm run dev
```

The local server defaults to [http://127.0.0.1:3001](http://127.0.0.1:3001).
Set `PORT` to use another port.

## Build

```sh
npm run build
```

The static output is written to `dist/`.

## Preview the build

```sh
npm run preview
```

## Cloudflare Pages

Use these settings:

- Project root: `peels-org`
- Build command: `npm run build`
- Build output directory: `dist`

The page intentionally includes `noindex, follow` robots metadata for this
temporary phase.
