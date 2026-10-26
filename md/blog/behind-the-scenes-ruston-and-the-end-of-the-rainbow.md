---
title: "Behind the Scenes: Ruston and the End of the Rainbow"
description: "A work-in-progress look at an animated short I'm making with AI video tools: locked character looks, one approved still per shot, a strict color rule, and the fixes that kept it on model."
canonical: "https://steveknowsweb.com/blog/behind-the-scenes-ruston-and-the-end-of-the-rainbow"
date: "2026-10-26"
author: "Steve Luiting"
category: "AI Video"
tags: "AI Video, Animation, Grok Imagine, FFmpeg, Work in Progress"
language: "en"
---
*Work in progress: 68 of about 89 shots are locked, the current rough cut runs 3:31, and the score is still to come.*

"Ruston and the End of the Rainbow" is an animated short I'm making with AI video tools. It started as a fun idea and turned into the best test I've had of what an AI-assisted film pipeline can actually do when one person is directing every frame.

### The story

Captain Gray steals the color from the home world, and everything turns grayscale. Ruston and his tiny sister Reese climb a rainbow, fly a yellow biplane, and team up with a winged rainbow T-rex. In a warehouse showdown they splash Gray with rainbow paint, escape, and reach a floating rainbow gate in Rainbow Land. Still to come are a gold scale the kids decide not to sell, the ride home, and a backyard sunset. Ruston does most of the talking. Reese has exactly one word: "Again."

![A winged rainbow T-rex catches a tiny girl in mid air](https://steveknowsweb.com/assets/images/ruston-post/62-trex-catches-reese-v1.jpg)

*Shot 62: the T-rex catches Reese.*

### Color as a rule, not an accident

The look rests on one rule: the home world is grayscale, while the kids, the T-rex, the biplane and the rainbow stay in full color. Writing that down as a style rule made every shot easier to judge. If something gray picked up color, or a hero lost it, the shot went back.

### The workflow

-   **Lock the look first.** Every character gets a character sheet and approval stills before any animation happens.
-   **One still, one shot.** Each shot is animated from its approved still as a short clip in Grok Imagine.
-   **Check everything.** Every clip is reviewed with a frame grid and an automatic transcript, then I approve it and lock it as a numbered shot.
-   **Assemble in FFmpeg.** The edit is built shot by shot from the locked clips.
-   **Leave room for music.** Clips are generated without music so the score, made in Suno, can go on at the end.

![Captain Gray splashed with rainbow paint in a warehouse](https://steveknowsweb.com/assets/images/ruston-post/65-gray-paint-v1.jpg)

*Shot 65: Captain Gray gets a face full of rainbow paint.*

### What the AI got wrong, and how I fixed it

-   **Lines going to the wrong character.** In wide shots the AI kept handing dialogue to whoever was nearby. Ruston's "Yes it is!" came out of Captain Gray, then the T-rex. The fix was a close-up insert for the line, then a cut back to the wide.
-   **Lettering falls apart in motion.** Words like "GRAY" on the plane garble as soon as things move, so shots with text stay mostly static.
-   **Consistency takes constant attention.** Reese kept growing too big, and Gray's skin had to be pulled back to gray again and again.
-   **Big files, many machines.** Large clips had to be split to move between computers.

![Captain Gray, dripping with rainbow paint, still standing in the warehouse](https://steveknowsweb.com/assets/images/ruston-post/66-not-over-v1.jpg)

*Shot 66: it's not over yet.*

### What it says about the work

The tools generate the frames, but the film still comes from decisions: what the rule is, which take is right, when a shot needs a close-up instead of another regeneration. That is the same art direction I bring to websites and print, applied one locked shot at a time.

![The rainbow T-rex racing toward a floating rainbow gate](https://steveknowsweb.com/assets/images/ruston-post/68-gate-reveal-v2.jpg)

*Shot 68: racing toward the rainbow gate. The latest locked shot.*

The rest of the shots and the score are next. If you're working on animation, video or a creative project that needs this kind of hands-on direction, say hello at [hello@steveknowsweb.com](mailto:hello@steveknowsweb.com).
