# XPUI

A declarative UI framework for e-ink screens, in Rust. A screen is written once
against `xpui`'s traits and runs on any backend — a C++ firmware drawing
through FreeInkUI, a bare-metal Rust firmware drawing through
`embedded-graphics`, or a window on a laptop. The framework has no
dependencies, runs `no_std` on bare metal, and names no product, device or
backend; everything else depends inward on it.

## The repositories

| | |
|---|---|
| [`xpui-framework`](https://github.com/XPUI-Framework/xpui-framework) | The crate `xpui`: the framework itself, and the orientation for all ten |
| [`xpui-chrome`](https://github.com/XPUI-Framework/xpui-chrome) | The eight themed components a backend paints, from drawing primitives alone |
| [`xpui-boards`](https://github.com/XPUI-Framework/xpui-boards) | Seven devices as data: panel size, key row, and the body in tenths of a millimetre |
| [`xpui-backends`](https://github.com/XPUI-Framework/xpui-backends) | Two backends: `embedded-graphics`, and FreeInkUI over a C ABI |
| [`xpui-simulator`](https://github.com/XPUI-Framework/xpui-simulator) | An `xpui` app in a desktop window, on any board's panel |
| [`xpui-gallery`](https://github.com/XPUI-Framework/xpui-gallery) | The reference application, and the seven-board conformance suite it doubles as |
| [`xpui-rp2040`](https://github.com/XPUI-Framework/xpui-rp2040) | The gallery as firmware, run on the Pimoroni Badger 2040 and Tufty 2040 |
| [`xpui-esp32`](https://github.com/XPUI-Framework/xpui-esp32) | The gallery as firmware for the Xteink X3 and the Seeed Sticky — both images build; no panel driver yet |
| [`xpui-cpp`](https://github.com/XPUI-Framework/xpui-cpp) | Hosting `xpui` screens inside a C++ firmware, over a stable C ABI |
| [`xpui-dev`](https://github.com/XPUI-Framework/xpui-dev) | The umbrella: the nine built as one, and the checks no single repository can make |

## Start here

[`xpui`'s README](https://github.com/XPUI-Framework/xpui-framework/blob/main/README.md)
is the first minute: what the framework is, how to depend on it today, and the
shortest screen that runs.
[`docs/orientation.md`](https://github.com/XPUI-Framework/xpui-framework/blob/main/docs/orientation.md)
is the first hour: what the ten are, how they sit on disk, what a clean machine
needs, and how a change is proved.

## Licence and contact

MIT — all ten carry it;
[the framework's copy](https://github.com/XPUI-Framework/xpui-framework/blob/main/LICENSE)
is the text. Write to <contact@xpui.rs>; conduct reports go to
<conduct@xpui.rs>, the address every `CODE_OF_CONDUCT.md` names.
