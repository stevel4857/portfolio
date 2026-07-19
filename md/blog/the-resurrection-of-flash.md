---
title: "The Resurrection of Flash"
description: "Flash is back from the dead it seems — and for certain archival and cultural projects, that's actually good news."
canonical: "https://steveknowsweb.com/blog/the-resurrection-of-flash"
date: "2023-11-23"
author: "Steve Luiting"
category: "Legacy Web"
tags: "Flash, Archives, Museums"
language: "en"
---
At The Cable Center, the learning-station kiosks were built around Flash on two levels: **Flash drove the animation** visitors saw on screen, and the **kiosk UI itself was authored in Flash**. When those exhibits stopped working, the problem was not just that Flash had been discontinued — **the source files had disappeared**, and the **old working project files were corrupted**. I had no clean files left to rebuild the exhibit from, so I recovered what I could from the compiled .swf outputs and brought the interactives back. If today they wanted to use Flash once again, I could restore them via modern tools like Ruffle.

Kinect experiments on Cable Center learning stations, 2011 — Flash animation and a Flash-built kiosk interface. The original source files were later lost; what remained of the working project files was corrupted.

For museums and cultural organizations, Flash was once the standard for rich interactive exhibits. When it was killed off, a huge amount of important digital heritage effectively died with it.

Thanks to open-source projects like Ruffle, many of those experiences can live again — safely, in the browser, with no plugins required from visitors.

I've been quietly resurrecting Flash-based work for clients who need their history to remain accessible. It's one of the more satisfying parts of what I do.

### Embedding Ruffle yourself

Here are the exact steps and code snippets you can copy. Ruffle lets you play legacy Flash (SWF) files directly in modern browsers — no plugin required.

### Live Demo (right here on this page)

This page loads Ruffle and plays a real SWF at `/flash/techlogo.swf`:

Click if you see a sound/unmute overlay. If the player does not load, allow scripts from unpkg.com or jsdelivr.net (some privacy tools block CDNs).

To embed Flash on your own site, follow the steps below.

#### Step 1: Include Ruffle

Add this in the `<head>` of your HTML page:

```
<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
<!-- If unpkg is blocked, use: https://cdn.jsdelivr.net/npm/@ruffle-rs/ruffle -->
```

#### Step 2: Add a sized container, then create the player

Put the container in the page first. Give it a **real width and height** (pixels work best). Then create the player after load. Avoid relying only on `height: 100%` when the parent has no definite height — that often collapses in Firefox.

```
<div id="container" style="width:600px;height:400px;background:#000;"></div>
<script>
window.RufflePlayer = window.RufflePlayer || {};
// Force autoplay, hide splash, hide unmute overlay (sound still needs a user gesture in some browsers)
window.RufflePlayer.config = {
  autoplay: "on",
  splashScreen: false,
  unmuteOverlay: "hidden"
};
window.addEventListener("load", () => {
  const container = document.getElementById("container");
  if (!container || !window.RufflePlayer) return;

  const ruffle = window.RufflePlayer.newest();
  const player = ruffle.createPlayer();
  container.appendChild(player);

  // Fill the sized container
  player.style.width = "100%";
  player.style.height = "100%";
  player.style.display = "block";

  // Path from your site root (change to match your SWF)
  player.load("/flash/techlogo.swf");
});
</script>
```

#### Full standalone webpage example

Copy into an `index.html` next to your `.swf` (or adjust the path). This version uses an aspect-ratio box and absolute-fill player so it sizes correctly in Chrome and Firefox. AS2 files usually play immediately; AS3 may show a play button; audio may still need a click-to-unmute depending on the browser.

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ruffle demo</title>
  <script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
  <style>
    html, body {
      margin: 0;
      min-height: 100%;
      background: #111;
    }
    #container {
      position: relative;
      width: min(100%, 640px);
      margin: 1rem auto;
      aspect-ratio: 4 / 3;
      max-height: 60vh;
      min-height: 240px;
      background: #000;
      overflow: hidden;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script>
    window.RufflePlayer = window.RufflePlayer || {};
    window.RufflePlayer.config = {
      autoplay: "on",
      splashScreen: false,
      unmuteOverlay: "hidden",
      quality: "high",
      letterbox: "on",
      scale: "showAll"
    };
    window.addEventListener("load", () => {
      const container = document.getElementById("container");
      if (!container || !window.RufflePlayer) return;

      const ruffle = window.RufflePlayer.newest();
      const player = ruffle.createPlayer();
      container.appendChild(player);

      // Absolute fill — works with aspect-ratio parents in Firefox and Chrome
      player.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";

      // Same folder as this HTML: "my-movie.swf"
      // From site root: "/flash/my-movie.swf"
      player.load("my-movie.swf");
    });
  </script>
</body>
</html>
```

#### Complete list of configuration options

Here are common options you can pass to `window.RufflePlayer.config` (set this *before* calling `createPlayer()`):

```
window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
  // Page-wide
  publicPath: undefined,
  polyfills: true,

  // Per-player behavior
  allowScriptAccess: false,
  autoplay: "auto",           // "on" | "off" | "auto"
  unmuteOverlay: "visible",   // "visible" | "hidden"
  backgroundColor: null,
  wmode: "window",
  letterbox: "on",            // "off" | "on" | "fullscreen"
  warnOnUnsupportedContent: true,
  contextMenu: "on",
  showSwfDownload: false,
  upgradeToHttps: window.location.protocol === "https:",
  maxExecutionDuration: 15,
  logLevel: "error",
  base: null,
  menu: true,
  salign: "",
  forceAlign: false,
  scale: "showAll",
  forceScale: false,
  frameRate: null,
  quality: "high",
  splashScreen: true,
  preferredRenderer: null,    // null | "webgl" | "canvas" | "webgpu"
  openUrlMode: "allow",
  allowNetworking: "all",
  favorFlash: true,
  socketProxy: [],
  fontSources: [],
  defaultFonts: {},
  credentialAllowList: [],
  playerRuntime: "flashPlayer",
  allowFullscreen: false
};
```

Experiment with these to match your original Flash experience as closely as possible. If something plays in Chrome but not Firefox, check the container has a real height (or use the aspect-ratio + absolute-fill pattern above) and that Ruffle is not blocked by tracking protection.
