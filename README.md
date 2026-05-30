# JIB — Jack In the Box

**SimHub plugin & device host for StreamDock-compatible hardware.**

JIB bridges SimHub telemetry with StreamDock LCD button boxes. Render live data on hardware keys, map physical controls to any action (keyboard, mouse, vJoy, media, system), manage multi-page touch layouts, and control LEDs — all from a native Windows Configurator.

---

## Architecture

```
SimHub.exe
  └── SimHub.JIB.Plugin.dll  ────┐
                                  │ TCP (port 16555, line-delimited JSON)
JIB.Configurator.exe (WinUI 3) ───┤ TCP (port 16550, 4-byte length-prefix JSON)
                                  │
JIB.Service.exe (Windows host) ───┘
  ├── Plugins: SimHub, Keyboard, Mouse, vJoy, Media, System
  ├── SkiaSharp rendering (~20 FPS CPU raster → JPEG)
  └── StreamDockNative.dll (C++ USB HID + SDK passthrough)
```

- **JIB.Service** — background host managing hardware, plugins, rendering, and IPC
- **JIB.Configurator** — WinUI 3 desktop application for visual editing
- **SimHub.JIB.Plugin** — lives inside SimHub, streams telemetry to the host
- **StreamDockNative** — C++ native layer for USB communication

The Configurator and SimHub plugin communicate with the host over TCP. There is no shared DLL between them.

---

## Installation

1. **Download** the latest ZIP from [GitHub Releases](https://github.com/androme13/JIB/releases)
2. **Extract** the package and read README.txt
3. **Launch** `JIB.Service.exe` to start the device host (or install as a Windows service)
4. **Open** `JIB.Configurator.exe`, connect to the host, and start configuring

---

## Features

### Live telemetry display

Real-time SimHub telemetry rendered as JPEG frames on StreamDock LCD keys at ~20 FPS. Supports numeric gauges, bar gauges, text overlays, and state-dependent coloring (normal vs. alert states). Delta hashing avoids re-rendering frames that haven't changed.

**Supported telemetry categories:** speed, RPM, gear, fuel, water/oil temperatures, turbo pressure, ERS, DRS, ABS, TC, brake bias, headlights, wipers, flags, cruise control, parking brake, retarder, diff lock, navigation, trucking data, and more.

### Physical controls & dispatch

Every hardware button, knob turn/press, touch zone, and swipe gesture can be mapped to:

| Category | Examples |
|---|---|
| **SimHub Control Mapper** | Custom roles defined in SimHub |
| **Keyboard** | Any key or hotkey combination |
| **Mouse** | Click, double-click, scroll, move |
| **vJoy** | Virtual joystick buttons (128) and axes (8) |
| **Media** | Play/Pause, next/previous, volume, per-app audio |
| **System** | Shutdown, restart, sleep, lock, brightness, monitor off |
| **Internal** | Touch page navigation |

### Touch pages & swipe navigation

Touchscreen devices (N4, N4 Pro) support multiple main pages, each containing nested touch pages. Swipe left/right navigates between pages. A "home" page anchors the default view. Full CRUD from the Configurator.

### LED & brightness control

- **Global RGB LED color** — single color across all device LEDs
- **Per-key LED** — individual colors per key (N4 Pro)
- **Knob LED rings** — per-knob RGB control (N4 Pro)
- **Panel brightness** — LCD screen brightness 0–100 %
- **Animated GIF** — key GIF and background GIF (device-dependent)

Feature transport (SDK vs. native HID) is resolved per device model, not via a global switch.

### Profiles & workspaces

- **Vehicle profiles** with learned telemetry min/max values per car
- **Per-profile mapping overrides** on top of global workspace
- **Composite workspace save/load** — atomic save of bindings, subscriptions, render profile, behavior, and layout

### Plugin system

JIB loads plugins from `Plugins/` at startup. Six built-in plugins are included. Third-party plugins can be authored against the `JIB.Sdk` package.

Plugins have:
- Typed settings (TextBox, Toggle, NumberBox, ComboBox, Endpoint)
- Health monitoring (10 s interval, auto-disable after 5 consecutive failures)
- Enable/disable per plugin from the Configurator
- `[JibPlugin]` attribute for display metadata

---

## Built-in plugins

### SimHub
Live telemetry from any racing simulator. Exposes hundreds of telemetry fields as assignable display functions. Also publishes SimHub Control Mapper roles and event triggers for bidirectional control. Game-aware: rebuilds path mappings automatically when the active simulator changes. Per-vehicle learned value profiles.

### Keyboard
Map any StreamDock button to a keyboard key or key combination (modifiers + key). Dispatches Press/Release events to the OS for held actions like push-to-talk or modifier keys.

### Mouse
Left, middle, and right clicks. Double-click. Scroll up/down. Relative cursor movement (delta) and absolute positioning. Configurable sensitivity (1–200 %) and scroll speed (1–20 notches).

### vJoy
Virtual joystick output via the vJoy driver. Auto-discovers configured vJoy devices. Up to 128 buttons and 8 axes (X, Y, Z, RX, RY, RZ, Slider1, Slider2) per device. Press/Release dispatch for held button states, PulseOnly for instant axis actions.

### Media
Multimedia transport: Play/Pause, Next Track, Previous Track. Volume Up, Volume Down, Mute. Per-application audio discovery dynamically creates individual volume controls for every active audio application. Master volume level exposed as a renderable gauge (0–100 %).

### System
System resource telemetry gauges: CPU Usage, RAM, GPU (usage, VRAM, temperature), network throughput, uptime, battery level. System commands: shutdown, restart, sleep, hibernate, lock, brightness up/down, monitor off.

---

## How mapping works

Every hardware control follows the same mapping flow:

```
Plugin Provider  →  Assignable Function  →  Dispatch Mode  →  Hardware Control
```

### 1. Choose a source
Select a plugin provider (SimHub, Keyboard, Mouse, vJoy, Media, System) and one of its assignable functions — a telemetry gauge, a keyboard key, a SimHub role, a media command, or a system action.

### 2. Pick a dispatch mode

| Mode | Behaviour | Use for |
|---|---|---|
| **Press / Release** | Held signal with distinct press and release events | Keyboard shortcuts, vJoy button hold, push-to-talk |
| **PulseOnly** | Instant one-shot trigger | Page navigation, mute, system commands |
| **Auto** | Plugin-recommended default (fallback depends on `MappingTargetKind`) | General use |

### 3. Assign to a hardware control
Bind the mapping to a physical button press/release, knob turn (left/right), knob press, touch zone tap, or swipe gesture (left/right). The Configurator shows a live preview as you edit.

### Hardware control types

| Control | Supported on |
|---|---|
| Button press / release | All LCD key devices |
| Knob turn left / right | N3, N4, N4 Pro, M3, K1 Pro |
| Knob press | N4, N4 Pro, K1 Pro |
| Touch zone tap | N4, N4 Pro (touchscreen surfaces) |
| Swipe left / right | N4, N4 Pro (touchscreen surfaces) |
| Auxiliary button | N3, N1, M18 (non-LCD buttons) |

---

## Hardware compatibility

JIB maintains a hardware catalog with VID:PID identification for 10 device families and 25+ branded models.

| Brand | Model | Status | Family | Details |
|---|---|---|---|---|
| MiraBox | N3 | Full support | SDN3 | 3×2 keys · 3 knobs · 3 aux buttons · native brightness |
| Ajazz | AKP03 / AKP03E / AKP03R | Full support | SDN3 | |
| Soomfon | Stream Controller SE | Full support | SDN3 | |
| Mars Gaming | MSD-TWO | Full support | SDN3 | |
| TreasLin | N3 | Full support | SDN3 | |
| Redragon | Skyrider SS-551 | Full support | SDN3 | |
| MiraBox | 293 V2 / V3 | Full support | SD293 | 5×3 keys |
| MiraBox | 293S | Full support | SD293S | 5×3 keys · 3 screens · key GIF |
| FHOOU | 293S | Full support | SD293S | Rebrand of MiraBox 293S (VID:PID 5548:6670) |
| Ajazz | AKP153 / AKP153E / AKP153R | Full support | SD293S | |
| Mars Gaming | MSD-ONE | Full support | SD293S | 293S rebrand |
| Maddog | GK150K | Full support | SD293S | |
| Risemode | Vision 01 | Full support | SD293S | |
| TMICE | Stream Controller | Full support | SD293S | |
| Soomfon | XF-CN001 | Full support | SD293S | |
| MiraBox | N4 / N4 E | Full support | SDN4 | 5×2 keys · 1 touchscreen · 4 knobs · touch/swipe · native brightness |
| Ajazz | AKP05E | Full support | SDN4 | Non-Pro family |
| MiraBox | N4 Pro / N4 Pro E | Full support | SDN4 Pro | 5×2 keys · 1 touchscreen · 4 knobs · per-key LED · knob LED rings · native brightness |
| Ajazz | AKP05E PRO | Full support | SDN4 Pro | Pro family · knob LED rings · vibration |
| MiraBox | N1 | Partial support | SDN1 | 5×3 keys · 3 screens · 1 knob · 2 aux buttons |
| VSD | N1 | Partial support | SDN1 | Hardware validation in progress |
| MiraBox | M18 / M18E | Partial support | SDM18 | 5×3 keys · 3 aux buttons · key + BG GIF |
| MiraBox | M3 | Full support | SDM3 | 5×3 keys · 3 knobs · key + BG GIF |
| MiraBox | XL / XLE | Experimental | SDXL | 8×4 keys · key + BG GIF · pending end-to-end validation |
| MiraBox | K1 Pro / K1 Pro EU | Experimental | K1Pro | 3×2 keys · 3 knobs · key GIF · pending end-to-end validation |

**Status legend:**
- **Full support** — validated in normal use, recommended for end users
- **Partial support** — usable, features or behaviours still under validation
- **Experimental** — native driver registered, not yet validated end to end

---

## Configurator overview

The JIB Configurator is a WinUI 3 desktop application for visual editing.

### Screens

| Screen | Purpose |
|---|---|
| **Overview** | Host status at a glance |
| **Devices** | Hardware inventory, capabilities, diagnostics per device |
| **Controls** | Visual button layout editor, touch pages, mapping assignment |
| **Plugins** | Plugin management — health, settings, enable/disable |
| **Settings** | Host settings — palette, FPS, brightness, transport policy |
| **Hosts** | LAN host discovery and connection |
| **Transports** | TCP transport configuration |
| **Logs** | Runtime log viewer |
| **Debug** | Developer diagnostics |

### Composite save model

The Configurator uses a global save entry point. Individual editors show their state via colour-coded chips but do not have local save buttons:
- **Gray** — clean, no pending changes
- **Orange** — dirty, unsaved changes
- **Blue** — saving in progress
- **Green** — saved successfully
- **Red** — save failed

---

## SDK (for plugin developers)

Third-party plugins can be authored against the `JIB.Sdk` NuGet package. Two authoring modes are available:

- **SDK-only** — parameterless constructor, portable, suitable for third-party distribution
- **Internal host** — constructor receives `DeviceHostPluginServices` with full access to `RuntimeProviderChangeTracker`, transports, and host services

Key SDK concepts:
- `IDeviceHostPlugin` / `DeviceHostPluginBase` — base plugin contract
- `RuntimeProviderChangeTracker` — push live state updates (catalog changes, control states)
- `[JibPlugin]` attribute — display metadata (name, description, version)
- Typed settings system — auto-generated UI editors in the Configurator
- Static vs. dynamic catalogs — choose based on whether functions are known at compile time
- Health monitoring — automatic with configurable disable threshold

The IPC protocol is documented in [`docs/IPC-Protocol.md`](docs/IPC-Protocol.md). Sample plugins are provided in `Plugins/Samples/`.
