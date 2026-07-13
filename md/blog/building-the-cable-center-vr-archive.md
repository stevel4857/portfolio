---
title: "Building the Cable Center VR Archive"
description: "The Cable Center has moved a few blocks away — but the original building lives on in VR. Here's the browser walkthrough with glTF architecture, floating 360° video spheres, and the same preservation story from 2014."
canonical: "https://steveknowsweb.com/blog/building-the-cable-center-vr-archive"
date: "2026-06-20"
author: "Steve Luiting"
category: "Projects"
tags: "VR, Museums, Preservation, Unity, A-Frame, WebXR, Syndeo Institute"
language: "en"
---
In 2014 we set out to do something ambitious: recreate the entire Cable Center building as a fully interactive virtual experience.

Working with a small team headed by Nic van Dessel and myself, we modeled the architecture, digitized hundreds of artifacts, and integrated real 360° video oral histories so visitors could literally step inside the stories. The building was home to the **Syndeo Institute** — the cable industry's archive and education center in Denver.

[Virtual Reality Exhibit Launch Video 2017](https://youtu.be/nDb2WEB9ZTo) — the original launch video for the Cable Center VR archive on Steam and Meta Quest.

[Cable Center VR — first test](https://youtu.be/5K4nHnxV364) — an early test of the experience before the full web recreation.

[First 360 video made for VR Exhibit](https://youtu.be/Ley119tRBF8) — click and drag to look around.

This exhibit was never just a tech demo. The Cable Center held decades of cable-industry history — oral histories, artifacts, and a physical building most people would never walk through in person. The goal was to meet people where they already were: on a headset at home, or later in a browser, without requiring a trip to Denver.

360° video was the bridge. Instead of reading about a conversation in a library or office, visitors could stand inside it. Combined with a full 3D model of the building, the exhibit let researchers, students, and industry pioneers explore the architecture and the stories in the same place — a digital archive you could inhabit, not just search.

### The building today

The Cable Center is **no longer in that original building** — the organization has moved a few blocks away. The physical space we modeled, walked through, and filmed in 2014–2017 is not where visitors go today.

That makes the VR work more important, not less. The Steam and Quest builds, and the browser walkthrough below, preserve the *original* design: the architecture, the outdoor campus, and the story rings where oral histories were recorded. You can still fly up to the Hall of Fame level, stand on the plaza, and step inside the 360° videos — even though the real-world address has changed.

Digital preservation isn't only about saving files. It's about saving a place as people remember it.

### Why it still matters in 2026

Unlike most VR projects that age quickly, this one was built with longevity in mind. The experience is still available today on Steam and Meta Quest headsets — completely free.

It taught me that the best digital preservation work isn't about chasing the newest technology. It's about respecting the material and building something that can survive platform changes — including when an institution moves on from the building itself.

[Download the 2016 VR Article (PDF)](https://steveknowsweb.com/assets/pdf/VRArticleBroadband2016.pdf)

### 2026 update: Browser walkthrough + 360° video spheres

Distributing a full VR app is heavy. What if someone could simply open a web page, explore the original building, *and* play the oral-history videos?

I've rebuilt that experience for the browser using **A-Frame**, the original 2017 SketchUp export (converted to glTF 2.0), and the same 360° footage from the Unity archive. No app install. No headset required — though VR mode works if you have one.

Click inside the frame below to activate controls. Desktop: use **WASD** to fly around the building. Look for three floating preview spheres drifting toward you — each is a 360° oral history. **Click a sphere** to step inside the video; drag the mouse to look around. Press **ESC** to return to the walkthrough, or **Restart** to reset your view in front of the spheres.

[Open Full VR Experience →](https://steveknowsweb.com/demos/cable-center-vr.html)

### What we figured out with the video spheres

Combining a full glTF building with 360° video in one A-Frame page turned out to be trickier than either feature alone. A few things worth documenting:

-   **Floating preview spheres** — thumbnail-textured spheres animate toward the visitor near the building. Click one to launch that oral history.
-   **Scene-level video sphere** — the panorama must sit at scene level, not as a child of the camera. If it rotates with look-controls, mouse drag appears broken — you're spinning the texture with your head instead of looking around inside it.
-   **No `a-sky` during video** — a sky dome and a video sphere are both inner-facing shells; the sky paints over the top of the video. The walkthrough uses a scene background color instead, and the 3D environment hides during playback.
-   **Fog and render order** — the forest environment adds fog that can swallow a huge video sphere. Disabling fog during playback (and setting the video material to ignore fog) fixed a flat green wash where the panorama should be.
-   **Restart flow** — exiting video restores the glTF scene, recenters the player in front of the spheres, and replays their float-in animation so the experience has a clear starting point again.

The videos themselves are the same material from the original project — library sessions, office tours, and related 360° footage — now playable in the browser without opening the Unity build.

### What went into the web recreation

-   **Original 2017 model** — the same Simplygon-processed building mesh used in the Unity VR project
-   **glTF 2.0 conversion** via [convert3d.org](https://convert3d.org) — the old glTF 1.0 export wouldn't load in modern browsers
-   **A-Frame** for WebXR — desktop fly-through, mouse look, clickable spheres, and VR headset support from a single HTML file
-   **Outdoor lighting** — directional sun, hemisphere fill, and shadows so the glass, aluminum, and stone materials read clearly
-   **Drifting clouds** — independent cloud clusters with slow, separate motion (not one rigid rotating field)
-   **360° video integration** — preview spheres, full-sphere playback, mute/restart controls, and a clean handoff between walkthrough and video modes

When I helped modernize the [Syndeo Institute visual identity](https://steveknowsweb.com/work/syndeo) in 2018–2022, the building itself was already a character in the story. A web walkthrough doesn't replace the full VR archive or an in-person visit to the organization's new location — but it lowers the barrier dramatically. A student, researcher, or cable pioneer can open a link and experience the *original* Cable Center as it was designed and built. Same philosophy as the original: *meet people where they are*.

### What's next

Future passes could add walkable stair colliders, environment maps for glass reflections, more 360° videos at additional story-ring locations, and interior exhibit labels tied to the archive catalog.
