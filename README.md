# I/O Cellular Countdown

## Overview

I/O Cellular Countdown is a full-screen generative countdown for Google I/O that counts from 10 down to 0. Each second of the countdown swaps both the displayed digit and the underlying cellular automaton rule, so the visual texture of the background shifts every second, and at zero a "big bang" sequence detonates the field and settles into a still-life forest spelling out "I/O" in living cells.

[View on GitHub](#)

[Demo](#)

I also shared this project and my thoughts on building it in a [LinkedIn post](#).

## Learning Goals

- **Cellular Automata as Typography**: Treating Conway's Game of Life and nine other outer-totalistic rules (HighLife, Day & Night, 2x2, Seeds, Diamoeba, Maze, Replicator, Anneal, Life Without Death) as a living visual language that ties to a numerical countdown.
- **Single-Engine Rule Variation**: Designing a single B/S-notation tick function that drives ten visually distinct rules just by swapping the birth and survival sets, instead of writing a separate simulator per rule.
- **Generative Audio from Visual State**: Mapping cell birth events to a pentatonic Tone.js synth so the cellular automaton literally composes the score in real time, with adaptive throttling so dense rules do not flood the polyphony.
- **Choreographing a Climax**: Engineering the T-0 moment as a multi-stage sequence (white flash, R-pentomino soup, accelerated Conway, freeze, still-life "I/O" reveal) rather than a single transition, so the arrival has cinematic weight.
- **Maximalist Color in a Constrained Palette**: Using cell age as a color channel (blue → green → yellow → red) over an animated four-blob radial gradient mesh, keeping every pixel anchored to the I/O palette.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Animation**: Motion (formerly Framer Motion) for digit reveals and parallax
- **Audio**: Tone.js for the generative pentatonic score and FX chain
- **Rendering**: Canvas 2D with a downsampled bloom pass for cell glow
- **Typography**: Bagel Fat One (display) and JetBrains Mono (UI), via Google Fonts
- **Styling**: Hand-rolled CSS with custom properties (no framework)

## Takeaways

- **Smart reseeding beats reseeding every transition**: Wiping the grid on every digit change made the ten rules feel like ten unrelated screensavers. Reseeding only when the population collapses below a threshold lets each rule mutate the previous rule's pattern, which produces wilder and more coherent transitions.
- **Mix-blend-mode stacks fight each other**: Layering `screen` blends on the cell canvas, the bloom canvas, and the digit text washes everything to near-white over a bright gradient mesh. Restricting `screen` to the bloom layer and using `drop-shadow` filters for the digit's halo restored contrast.
- **`-webkit-text-fill-color` is required alongside `color: transparent`** when using `background-clip: text` with a gradient — otherwise WebKit can paint the inherited fill over the gradient and leave the text looking hollow at the edges.
- **A still-life forest reads as letters when you clear the field first**: Stamping a small "I/O" pattern over a sea of evolving cells made it illegible. Clearing the grid, stamping the letters, then sprinkling background still-lifes around them gave the wordmark unambiguous shape.
- **Generative audio needs adaptive throttling**: Some rules (Replicator, Seeds) explode into hundreds of births per tick, which would saturate any synth. Throttling note triggering by total birth volume keeps the score rhythmic instead of muddy.
- **Cache hits live in the rule string, not the engine**: Picking ten outer-totalistic rules that all run on the same grid + tick function meant ten visual identities for the cost of one engine. Cellular automata research is full of these "free" variants if you stay inside the B/S notation family.

## Controls

- `Enter` or `Space` — start the countdown
- `M` — toggle mute
- `R` — restart from T-10
