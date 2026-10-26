---
title: "Behind the Scenes: Ruston and the End of the Rainbow"
description: "How I'm directing and editing an animated short with AI: numbered shot plans, character sheets and a strict color rule, close-up inserts for continuity, an approve and lock process, and FFmpeg assembly."
canonical: "https://steveknowsweb.com/blog/behind-the-scenes-ruston-and-the-end-of-the-rainbow"
date: "2026-10-26"
author: "Steve Luiting"
category: "AI Video"
tags: "Video Editing, Animation, AI Video, Grok Imagine, FFmpeg, Visual Style"
language: "en"
---
*Work in progress: 68 of about 89 shots are locked, the current rough cut runs 3:31, and the score is still to come.*

"Ruston and the End of the Rainbow" is an animated short I'm directing and editing with AI video tools. The tools generate frames, but the film comes from the same things any edit depends on: a shot plan, a consistent visual style, continuity, and a process that keeps every decision on record.

### The story

Captain Gray steals the color from the home world, and everything turns grayscale. Ruston and his tiny sister Reese climb a rainbow, fly a yellow biplane, and team up with a winged rainbow T-rex. In a warehouse showdown they splash Gray with rainbow paint, escape, and reach a floating rainbow gate in Rainbow Land. Still to come are a gold scale the kids decide not to sell, the ride home, and a backyard sunset. Ruston carries the dialogue. Reese has exactly one word: "Again."

![A winged rainbow T-rex catches a tiny girl in mid air](https://steveknowsweb.com/assets/images/ruston-post/62-trex-catches-reese-v1.jpg)

*Shot 62: the T-rex catches Reese.*

### A style guide, applied to every frame

I treated the film like a brand system. Every character has a character sheet and approved reference stills before a single shot is animated, so the look is decided once and then protected. The color story is a written rule: the home world is grayscale, while the kids, the T-rex, the biplane and the rainbow stay in full color. With the rule on paper, judging a shot is simple. If something gray picks up color, or a hero loses it, the shot goes back.

### Shot planning and an approve and lock process

-   **Plan by shot.** The film is broken into about 89 numbered shots, and each one starts from its own approved still.
-   **Generate.** Each still is animated as a short clip in Grok Imagine.
-   **Review.** Every clip is checked with a frame grid and an automatic transcript, so motion, continuity and dialogue are all verified, not guessed.
-   **Approve and lock.** Once a clip passes, it is approved and locked as a numbered shot. Locked shots don't change, which keeps the cut stable while the rest of the film is built.
-   **Assemble.** The edit is cut together in FFmpeg from the locked shots, so every version of the rough cut can be rebuilt exactly.

![Captain Gray splashed with rainbow paint in a warehouse](https://steveknowsweb.com/assets/images/ruston-post/65-gray-paint-v1.jpg)

*Shot 65: Captain Gray gets a face full of rainbow paint.*

### Editing problems, solved with editing

-   **Dialogue on the wrong character.** In wide shots the AI kept handing lines to whoever was nearby. Ruston's "Yes it is!" came out of Captain Gray, then the T-rex. Instead of regenerating forever, I cut to a close-up insert for the line and then back to the wide, the same fix an editor would use on live footage.
-   **Continuity.** Reese kept drifting too big, and Gray's skin kept drifting away from gray. The character sheets made those errors easy to spot and correct shot by shot.
-   **Type in motion.** Lettering like "GRAY" on the plane garbles when things move, so shots with text stay mostly static.
-   **Large media.** Big files are split to move cleanly between machines, so nothing is lost between versions.

![Captain Gray, dripping with rainbow paint, still standing in the warehouse](https://steveknowsweb.com/assets/images/ruston-post/66-not-over-v1.jpg)

*Shot 66: it's not over yet.*

### Built for sound

Every clip is generated without music, so the picture is cut clean and the score can be built to it. The score will be made in Suno once the picture is locked, then laid in over the final edit.

![The rainbow T-rex racing toward a floating rainbow gate](https://steveknowsweb.com/assets/images/ruston-post/68-gate-reveal-v2.jpg)

*Shot 68: racing toward the rainbow gate. The latest locked shot.*

### What it shows

AI makes it possible for one person to produce an animated short, but it doesn't replace the craft. Planning shots, holding a visual style, fixing continuity in the edit and locking work in a clear order are what turn generated clips into a film. The remaining shots and the score are next.

Questions about the process? Say hello at [hello@steveknowsweb.com](mailto:hello@steveknowsweb.com).
