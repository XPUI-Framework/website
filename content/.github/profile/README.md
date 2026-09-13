# XPUI

A declarative UI framework for e-ink screens, in Rust. A screen is written once against `xpui`'s traits and runs on any backend — a C++ firmware drawing through FreeInkUI, a bare-metal Rust firmware drawing through `embedded-graphics`, or a window on a laptop. The framework has no dependencies, runs `no_std` on bare metal, and names no product, device or backend; everything else depends inward on it.

## Repositories

| | |
|---|---|
| [`xpui`](https://github.com/XPUI-Framework/xpui-framework) | The framework itself, and the orientation for the project |
| [`chrome`](https://github.com/XPUI-Framework/xpui-chrome) | The eight themed components a backend paints, from drawing primitives alone |
| [`boards`](https://github.com/XPUI-Framework/xpui-boards) | Seven devices as data: panel size, key row, and the body in tenths of a millimetre |
| [`backends`](https://github.com/XPUI-Framework/xpui-backends) | Two backends: `embedded-graphics`, and FreeInkUI over a C ABI |
| [`simulator`](https://github.com/XPUI-Framework/xpui-simulator) | An `xpui` app in a desktop window, on any board's panel |
| [`gallery`](https://github.com/XPUI-Framework/xpui-gallery) | The reference application, and the seven-board conformance suite it doubles as |
| [`rp2040`](https://github.com/XPUI-Framework/xpui-rp2040) | The gallery as firmware, run on the Pimoroni Badger 2040 and Tufty 2040 |
| [`esp32`](https://github.com/XPUI-Framework/xpui-esp32) | The gallery as firmware for the Xteink X3 and the Seeed Sticky — both images build; no panel driver yet |
| [`cpp`](https://github.com/XPUI-Framework/xpui-cpp) | Hosting `xpui` screens inside a C++ firmware, over a stable C ABI |
| [`dev`](https://github.com/XPUI-Framework/xpui-dev) | The umbrella: the nine built as one, and the checks no single repository can make |

## Start here

[XPUI](https://xpui.rs/docs/xpui), documentation is the first minute: what the framework is, how to depend on it today, and the shortest screen that runs.

[Orientation](https://xpui.rs/docs/xpui/orientation), is the first hour: what the repositories are, how they sit on disk, what a clean machine needs, and how a change is proved.
