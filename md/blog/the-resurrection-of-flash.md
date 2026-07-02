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

Here are the exact steps and code snippets you can copy. Ruffle lets you play legacy Flash (SWF) files directly in modern browsers.

### Live Demo (right here on this page)

Because we have included `<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>` in the <head> of this blog page (as you requested), here is a live working Flash file using flash/techlogo.swf:

Click if you see a sound/unmute overlay. The file is at flash/techlogo.swf relative to the site root.

To embed this on your own site, follow the steps below:

#### Step 1: Include Ruffle

First, add this code snippet into the <head> of your HTML page:

```
<script src="https://unpkg.com/@ruffle-rs/ruffle"></script>
```

#### Step 2: Add the player with custom config

Paste this code (or integrate the Ruffle init into an existing script block). This version forces autoplay, hides the splash screen, and enables sound without extra clicks:

```
<script>     
window.RufflePlayer = window.RufflePlayer || {}; 
// Below code forces autoplay, no splashscreen and allows sound 
window.RufflePlayer.config = { 
  "autoplay": "on",
  "splashScreen": false,
  "unmuteOverlay": "hidden"
}; 
// End custom configuration code above     
window.addEventListener("load", (event) => {         
  const ruffle = window.RufflePlayer.newest();         
  const player = ruffle.createPlayer();         
  const container = document.getElementById("container");         
  container.appendChild(player);         
  player.load("flash/techlogo.swf"); 
  player.style.width = "600px";
  player.style.height = "400px";   
}); 
</script> 
<div id="container"></div>
```

#### Full standalone webpage example (non-Wix HTML site)

Copy and paste the following into your index.html (change the .swf filename to match yours). AS2 Flash files typically play immediately with no overlays. AS3 files may show a play button if they work. Sound files will show a click-to-unmute warning.

```
<html> 
<head> 
<script src="https://unpkg.com/@ruffle-rs/ruffle"></script> 
<style>
html, body {
  margin: 0px;
}
</style>
</head> 
<body> 
<script>     
window.RufflePlayer = window.RufflePlayer || {}; 
// Below code forces autoplay, no splashscreen and allows sound 
window.RufflePlayer.config = { 
  "autoplay": "on",
  "splashScreen": false,
  "unmuteOverlay": "hidden",
  "quality": "medium"
}; 
// End custom configuration code above     
window.addEventListener("load", (event) => {         
  const ruffle = window.RufflePlayer.newest();         
  const player = ruffle.createPlayer();         
  const container = document.getElementById("container");         
  container.appendChild(player);         
  player.load("index-2023.swf"); 
  player.style.width = "100%";
  player.style.height = "100%";   
}); 
</script> 
<div id="container"></div> 
</body> 
</html>
```

#### Complete list of configuration options

Here are all the available options you can pass to `window.RufflePlayer.config`:

```
window.RufflePlayer = window.RufflePlayer || {};
window.RufflePlayer.config = {
    // Options affecting the whole page
    "publicPath": undefined,
    "polyfills": true,

    // Options affecting files only
    "allowScriptAccess": false,
    "autoplay": "auto",
    "unmuteOverlay": "visible",
    "backgroundColor": null,
    "wmode": "window",
    "letterbox": "fullscreen",
    "warnOnUnsupportedContent": true,
    "contextMenu": "on",
    "showSwfDownload": false,
    "upgradeToHttps": window.location.protocol === "https:",
    "maxExecutionDuration": 15,
    "logLevel": "error",
    "base": null,
    "menu": true,
    "salign": "",
    "forceAlign": false,
    "scale": "showAll",
    "forceScale": false,
    "frameRate": null,
    "quality": "high",
    "splashScreen": true,
    "preferredRenderer": null,
    "openUrlMode": "allow",
    "allowNetworking": "all",
    "favorFlash": true,
    "socketProxy": [],
    "fontSources": [],
    "defaultFonts": {},
    "credentialAllowList": [],
    "playerRuntime": "flashPlayer",
    "allowFullscreen": false
};
```

Experiment with these to match your original Flash experience as closely as possible.
