<!-- Images are hot-linked from the GitHub repo (main branch), so no manual upload is needed in the DEV editor. To add the demo GIF: record it, save it as docs/screenshots/demo.gif, push to main, then uncomment the GIF line in the Demo section. -->

*This is a submission for the [GitHub Finish-Up-A-Thon Challenge](https://dev.to/challenges/github-2026-05-21)*

## What I Built

The AI Sentiment Dashboard reads a sentence and shows the feeling behind each part of it, down to the exact words. You type a message, hit Analyze, and it splits the text into clauses, scores each one, and highlights which parts are positive, negative, or neutral. A line like "the food was amazing but the service was painfully slow" comes back as Mixed, with the praise in green and the complaint in red.

It started as a group project for my Artificial Intelligence course (CAP 4630) at Florida Atlantic University. The model side was the fun part, since reading sentiment clause by clause is a real step up from stamping one label on a whole sentence, but it stalled the way course projects do once the grade lands. It only ran on my laptop, the results were a plain wall of text, and the README still described a model we had already swapped out. Finishing it had been nagging at me for a while, so this challenge was the push to actually do it.

## Demo

**Live app:** https://ai-sentiment-dashboard.netlify.app
**Code:** https://github.com/MatthewOscar/AI-Sentiment-Dashboard-

The Mixed examples are the best place to start. Click one and watch the two clauses light up in different colors.

> Heads up: the API runs on a free Hugging Face Space that sleeps after a couple of days idle. The first load after a quiet stretch takes about 30 to 60 seconds to wake the model, and the app shows a "waking up" state while it does. It is instant after that.

![Demo: analyzing a mixed sentence](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/demo.gif)

![The dashboard analyzing a mixed sentence](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/after-mixed.png)

On a phone the layout stacks and the donuts become compact bars:

![Mobile layout](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/after-mobile.png)

## The Comeback Story

Here is the honest before. The entire result was a list of text lines:

![Before: results as a flat list of text](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/before-result.png)

The repo even had a "Future Improvements" list that named the two things we never got to: a word-level explainability view, and a real deployment. I made that list the plan, checked off both boxes, and then kept going.

What changed:

- **In-text highlighting.** The sentence is re-rendered with each clause colored by its sentiment, so you can see which words drove the result. Hovering a chart entry lights up its phrase in the text, and hovering a phrase lights up its chart entry.
- **A real dashboard.** An animated confidence gauge for the overall read, plus a per-clause probability breakdown shown as donut charts on desktop and stacked bars on mobile, laid out in a side rail next to the highlighted text. The visuals are hand-built SVG, so the bundle stays small and the styling matches the theme.
- **It is actually deployed.** The React app runs on Netlify and the Python model API runs on a Hugging Face Docker Space, wired together with an environment variable.
- **Honest internals.** The backend was loading a heavy spaCy transformer pipeline just to split sentences, so I swapped it for the small model and cut the cold start and memory hard. I fixed a bug where a neutral result always reported zero percent confidence, and added proper loading, empty, and error states with retry.
- **Polish that adds up.** A cached local history you can reopen instantly without re-calling the model, shareable links that carry the analyzed text in the URL, a backend status indicator, accessibility (keyboard submit, ARIA labels, and shape glyphs so meaning never rides on color alone), and light and dark themes that follow the system setting.

A small example of the kind of thing that was quietly wrong: a neutral result used to show zero percent confidence. Before and after:

| Before | After |
| --- | --- |
| ![Neutral showing 0.00%](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/before-neutral.png) | ![Neutral showing 98%](https://raw.githubusercontent.com/MatthewOscar/AI-Sentiment-Dashboard-/main/docs/screenshots/after-neutral.png) |

## My Experience with GitHub Copilot

Copilot earned its keep on the unglamorous parts of the rebuild. The fiddliest piece was mapping each model result back onto the original sentence so the right words light up, including the case where a clause comes back with a leading "but" attached. Copilot helped me work through that matching logic fast. It also sped up the SVG math behind the gauge and the donut segments, and getting the Dockerfile right so the model weights bake into the image at build time instead of downloading on the first request.

I still owned the decisions that shaped the result: dropping the heavy spaCy model, choosing hand-built SVG over a chart library to keep things lean, reporting neutral instead of a confident guess when the model was unsure, and framing the before-and-after. Copilot was fast hands. The direction was mine.

---

Revived and shipped solo by Matthew Wyatt. It began as a group course project at FAU, and the original team is credited in the [repo README](https://github.com/MatthewOscar/AI-Sentiment-Dashboard-).

Thanks for reading. If you try it, start with a Mixed example.
