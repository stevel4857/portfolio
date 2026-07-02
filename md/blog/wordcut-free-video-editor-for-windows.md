---
title: "WordCut — Free Video Editor for Windows"
description: "WordCut is a free Windows app I built with Whisper, FFmpeg, and pywebview — click words in a transcript to cut them from your video. Open source on GitHub."
canonical: "https://steveknowsweb.com/blog/wordcut-free-video-editor-for-windows"
date: "2026-07-02"
author: "Steve Luiting"
category: "AI & Tools"
tags: "WordCut, Open Source, Video, Whisper, Windows"
language: "en"
---
I built **WordCut** — a free Windows desktop app that lets you edit video by editing text. Transcribe speech with Whisper, click words to remove, and export a trimmed MP4. No subscription. No account. [Open source on GitHub](https://github.com/stevel4857/wordcut).

![Flat illustrated graphic of a friendly robot with scissors editing a video transcript — red words are cut from the export](https://steveknowsweb.com/assets/images/wordcut-blog-hero.jpg)

*WordCut — click words in a transcript to cut them from your video.*

This is the tool I hinted at in [my vibe coding post](https://steveknowsweb.com/blog/vibe-coding-motion-and-the-tools-im-watching) — Whisper, FFmpeg, and pywebview shipped as something real people can download and run.

WordCut

Click words to cut them from your video

Clickwordstoremovethemfromyourvideo

Animated preview — red words are cut from the export.

### What it does

1.  **Load** a local MP4 or paste a YouTube URL
2.  **Transcribe** with Whisper (word-level timestamps)
3.  **Click words** you want removed from the video
4.  **Export** `YourVideo_edited.mp4` in the same folder — original untouched

### Free to use

WordCut is **free and open source** under the MIT License. Use it, share it, modify it, build your own version. The standalone Windows build bundles FFmpeg and Whisper so users do not need Python installed.

### Built with

-   **Python** + **pywebview** — desktop UI
-   **faster-whisper** — speech-to-text
-   **FFmpeg** — audio extract, cut, stitch
-   **yt-dlp** — optional YouTube import
-   **PyInstaller** — standalone `WordCut.exe`

### Get it

[github.com/stevel4857/wordcut](https://github.com/stevel4857/wordcut) — source, build instructions, and the Windows release zip.

More detail on the [WordCut project page](https://steveknowsweb.com/work/wordcut).

*Related: [Vibe Coding This Site](https://steveknowsweb.com/blog/vibe-coding-motion-and-the-tools-im-watching), [Impact Studio](https://steveknowsweb.com/blog/impact-studio-a-builder-for-offline-work-and-real-publishing).*
