const repo = {
    owner: 'androme13',
    name: 'JIB',
    releasesUrl: 'https://github.com/androme13/JIB/releases',
    apiUrl: 'https://api.github.com/repos/androme13/JIB/releases'
};

const navLinks = [
    { label: 'Home', href: 'index.html', page: 'home' },
    { label: 'User Guide', href: 'guide.html', page: 'guide' },
    { label: 'Architecture', href: 'architecture.html', page: 'architecture' },
    { label: 'Developers', href: 'developers.html', page: 'developers' },
    { label: 'Download', href: 'index.html#latest', page: null },
    { label: 'GitHub', href: 'https://github.com/androme13/JIB', page: null, external: true }
];

const heroPoints = [
    ['Distributed by design', 'Host, Configurator, and SimHub plugin can each run on a separate machine over TCP.'],
    ['Host runtime', 'One Windows host owns the hardware, publishes device state, preview frames, and actions.'],
    ['Provider-based', 'Telemetry, input, media, OBS, HTTP, camera, and system actions share one mapping model.'],
    ['Real controls', 'Keys, knobs, touch pages, swipe zones, brightness, and LEDs are mapped explicitly.']
];

const features = [
    ['Live displays', 'Render values, labels, icons, pages, and live status onto hardware LCD keys and touch areas.'],
    ['Physical dispatch', 'Map each control to press/release, pulse-only, or provider-recommended dispatch behavior.'],
    ['Touch navigation', 'Build main pages and nested touch pages with swipe navigation and home page behavior.'],
    ['Plugin ecosystem', 'Ten built-in providers: telemetry, media, camera, keyboard, mouse, vJoy, OBS, HTTP, system, and monitor data.'],
    ['LED and brightness', 'Drive global LED state, per-LED targets, knob rings, and brightness where supported by the family.'],
    ['Shared rendering', 'Configurator previews and hardware frames use the same host renderer to reduce preview/device drift.'],
    ['Multi-machine setup', 'Keep the USB host near the hardware while SimHub and the Configurator live elsewhere on the LAN.'],
    ['Profiles & workspaces', 'Vehicle profiles, per-profile overrides, and atomic composite save of the whole layout.'],
    ['Third-party SDK', 'Author external plugins against JIB.Sdk and publish settings, catalogs, and health to the Configurator.']
];

const providers = [
    ['SimHub', 'Telemetry properties, values, and simulation-oriented controls from any racing simulator.'],
    ['Media', 'Playback, volume, mute, and per-application audio state actions.'],
    ['Camera', 'Local webcam or network stream (MJPEG/RTSP) rendered on device buttons through the host pipeline.'],
    ['Keyboard', 'Keystrokes and held-key behaviors for desktop or game bindings.'],
    ['Mouse', 'Button, movement, and pointer-oriented actions.'],
    ['vJoy', 'Virtual joystick buttons and axes for simulator input.'],
    ['OBS Studio', 'WebSocket v5 actions for scenes, recording, streaming, and source state.'],
    ['HTTP', 'Request-based integrations for local tools and dashboards.'],
    ['System Commands', 'Launch scripts, commands, and local automation hooks.'],
    ['System Monitor', 'CPU, memory, and host status values for rendered feedback.']
];

const jibSimhubProfiles = [
    ['Circuit racing', 'Assetto Corsa, Assetto Corsa Competizione, Assetto Corsa EVO, Automobilista 2, iRacing, Le Mans Ultimate, rFactor 2'],
    ['F1, rally, and road', 'DiRT Rally 2.0, EA SPORTS WRC 23/24, F1 23/24/25, Forza Horizon 4/5/6, BeamNG.drive'],
    ['Truck simulators', 'American Truck Simulator and Euro Truck Simulator 2, including truck-specific telemetry such as cruise, retarder, air brake, lights, wear, cargo damage, and navigation speed']
];

const media = [
    ['medias/Infos tab 1.png', 'Host information'],
    ['medias/Devices Tab 1.png', 'Device discovery'],
    ['medias/Devices tab 2.png', 'Device settings'],
    ['medias/Control tab 1.png', 'Controls and touch pages'],
    ['medias/Control tab 2.png', 'Mapping editor'],
    ['medias/Display tab 1.png', 'Display rendering'],
    ['medias/Plugins tab 1.png', 'Plugin providers'],
    ['medias/Plugins tab 2.png', 'Plugin settings'],
    ['medias/Datas tab 1.png', 'Provider data'],
    ['medias/Settings tab 1.png', 'Settings'],
    ['medias/Settings tab 2.png', 'Settings detail'],
    ['medias/Hosts tab 1.png', 'Host discovery'],
    ['medias/Hosts tab 2.png', 'Host administration'],
    ['medias/Transports tab 1.png', 'Transports'],
    ['medias/Debug tab 1.png', 'Diagnostics'],
    ['medias/Debug tab 2.png', 'Diagnostics detail'],
    ['medias/Logs tab 1.png', 'Logs'],
    ['medias/Options tab 1.png', 'Appearance options'],
    ['medias/About tab 1.png', 'About'],
    ['medias/Simhub N3 1.png', 'SimHub on MiraBox N3'],
    ['medias/Simhub N4PRO 1.png', 'SimHub on MiraBox N4 Pro'],
    ['medias/Simhub N4PRO 2.png', 'SimHub on MiraBox N4 Pro detail']
];

const compatibility = [
    ['MiraBox', 'N3', 'Catalog matched', 'SDN3', '3x2 keys, 3 knobs, 3 aux buttons, native brightness'],
    ['Ajazz', 'AKP03 / AKP03E / AKP03R', 'Catalog matched', 'SDN3', 'Known USB rebrand family'],
    ['Soomfon', 'Stream Controller SE', 'Catalog matched', 'SDN3', 'Known USB rebrand family'],
    ['Mars Gaming', 'MSD-TWO', 'Catalog matched', 'SDN3', 'Known USB rebrand family'],
    ['TreasLin', 'N3', 'Catalog matched', 'SDN3', 'Known USB rebrand family'],
    ['Redragon', 'Skyrider SS-551', 'Catalog matched', 'SDN3', 'Known USB rebrand family'],
    ['MiraBox', '293 V2', 'Catalog matched', 'SD293', '5x3 keys'],
    ['MiraBox', '293 V3', 'Needs device validation', 'SD293', 'Same 293-class family; exact revision needs owner validation'],
    ['upHere', '293V3', 'Needs device validation', 'SD293', '293V3 clone, awaiting real-device validation'],
    ['MiraBox', '293S / HSV293SV3', 'Catalog matched', 'SD293S', '5x3 keys, 3 screens, key GIF'],
    ['FHOOU', '293S', 'Catalog matched', 'SD293S', 'Shared HID manufacturer branding is preserved.'],
    ['Ajazz', 'AKP153 / AKP153E / AKP153R', 'Catalog matched', 'SD293S', 'Known USB rebrand family'],
    ['Mars Gaming', 'MSD-ONE', 'Catalog matched', 'SD293S', '293S rebrand'],
    ['Maddog', 'GK150K', 'Catalog matched', 'SD293S', 'Known USB rebrand family'],
    ['Risemode', 'Vision 01', 'Catalog matched', 'SD293S', 'Known USB rebrand family'],
    ['TMICE', 'Stream Controller', 'Catalog matched', 'SD293S', 'Known USB rebrand family'],
    ['Soomfon', 'XF-CN001', 'Catalog matched', 'SD293S', 'Known USB rebrand family'],
    ['MiraBox', 'N1', 'Catalog matched', 'SDN1', '5x3 keys, 3 screens, 1 knob, 2 aux buttons'],
    ['VSD', 'N1', 'Catalog matched', 'SDN1', 'Known USB rebrand family'],
    ['MiraBox', 'N4 / N4 E', 'Catalog matched', 'SDN4', '5x2 keys, 1 screen, 4 knobs, touch/swipe, native brightness'],
    ['Ajazz', 'AKP05E', 'Catalog matched', 'SDN4', 'Non-Pro family'],
    ['MiraBox', 'N4 Pro / N4 Pro E', 'Catalog matched', 'SDN4 Pro', '5x2 keys, 1 screen, 4 knobs, touch/swipe, knob LED rings, native brightness'],
    ['Ajazz', 'AKP05E PRO', 'Catalog matched', 'SDN4 Pro', 'Pro family, knob LED rings, vibration'],
    ['MiraBox', 'M18 / M18E', 'Catalog matched', 'SDM18', '5x3 keys, 3 aux buttons, Key + BG GIF'],
    ['MiraBox', 'M3', 'Catalog matched', 'SDM3', '5x3 keys, 3 knobs, Key + BG GIF'],
    ['MiraBox', 'XL / XLE', 'Needs device validation', 'SDXL', 'Family profile exists; exact USB commercial entry is not listed in the runtime catalog'],
    ['MiraBox', 'K1 Pro / K1 Pro EU', 'Needs device validation', 'K1Pro', 'Family profile exists; exact USB commercial entry is not listed in the runtime catalog'],
    ['Elgato', 'Stream Deck 2019 / Mk.2 / 15-Key Module', 'Needs device validation', 'SDClassic', 'Driver/catalog entry exists; real-device validation is still wanted. 5x3 keys (72x72), 480x272 LCD, JPEG, rotation 180deg'],
    ['Elgato', 'Stream Deck XL / XL 2022 / Module 32', 'Needs device validation', 'SDDXL', 'Driver/catalog entry exists; real-device validation is still wanted. 8x4 keys (96x96), 1024x600 LCD, JPEG, rotation 180deg'],
    ['Elgato', 'Stream Deck Neo', 'Needs device validation', 'SDNEO', 'Driver/catalog entry exists; real-device validation is still wanted. 4x2 keys (96x96) + 2 sensors, 480x320 LCD + 248x58 window, JPEG, rotation 180deg'],
    ['Elgato', 'Stream Deck +', 'Needs device validation', 'SDPLUS', 'Driver/catalog entry exists; real-device validation is still wanted. 4x2 keys (120x120) + 4 encoders, 800x480 LCD + touch window 800x100, JPEG, no rotation'],
    ['Elgato', 'Stream Deck + XL', 'Needs device validation', 'SDPLUSXL', 'Driver/catalog entry exists; real-device validation is still wanted. 9x4 keys (112x112) + 6 encoders, 1280x800 LCD + touch window 1200x100, JPEG, rotation 270deg']
];

const statusFilters = ['All', 'Catalog matched', 'Needs device validation'];

window.jibSiteData = {
    repo,
    navLinks,
    heroPoints,
    features,
    providers,
    jibSimhubProfiles,
    media,
    compatibility,
    statusFilters
};
