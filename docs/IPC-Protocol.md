# JSON IPC Protocol — JIB DeviceHost

## Wire format

### Configurator ↔ Host (port 16550)
Binary length-prefixed JSON, one request per TCP connection.

```
[4 bytes: Int32 little-endian payload length][N bytes: UTF-8 JSON]
```

### Host → Configurator events (port 16550 + 1, loopback)
Same length-prefixed format, push-only. Continuous stream of `RuntimeProviderStateChangedEvent`.

Subscription handshake:
```json
{
  "MessageType": "SubscribeEvents",
  "EventTypes": ["RuntimeProviderStateChangedEvent", "PluginHealthChangedEvent", "PluginDataChangedEvent", "WorkspaceChangedEvent", "ControlRenderChangedEvent", "LogEvent"],
  "ClientName": "JIB.Configurator",
  "ClientHostName": "WORKSTATION-01",
  "ClientProcessId": 12345,
  "ClientVersion": "1.0.0",
  "ClientSessionId": "4a4fd4b9bda64520b6d395f35bbd26a3"
}
```

`ClientName`, `ClientHostName`, `ClientProcessId`, `ClientVersion` and `ClientSessionId` are optional at the protocol level, but are used by the host to log persistent Configurator connections cleanly.

### SimHub Plugin ↔ Host (port 16555)
Line-delimited JSON (`StreamWriter.WriteLine` / `StreamReader.ReadLine`), persistent connection with handshake + heartbeat.

Handshake:
```
→ {"Handshake":"JIB.SimHub.Plugin","Version":"1.0"}
← {"Handshake":"OK","ProviderId":"simhub-channel"}
```

Heartbeat: ping/pong every 5s.

### Discovery (UDP port 16551)

**Primary mode — Active Request/Reply**

The Configurator opens an ephemeral UDP socket (port 0), sends a `DiscoverRequest` broadcast on port 16551, then collects unicast replies during a 1.5 s window. Replies are deduplicated by `host:port`.

```
Query  → {"MessageType":"DiscoverRequest"}
Reply  ← {"Service":"JIB.DeviceHost","Host":"<LAN-IP>","Port":16550,"Version":"1.0"}
```

**Secondary mode — Periodic beacon**

The host sends a broadcast beacon every 2 seconds. This signal remains available as a passive complement, but Configurator discovery no longer depends on it.

```
Beacon → {"Service":"JIB.DeviceHost","Host":"<LAN-IP>","Port":16550,"Version":"1.0"}
```

**Local fast-path**

If the file `%TEMP%\JIB.Service.port` (JSON `{"Port":<tcpPort>}`) exists, the Configurator attempts a direct TCP connection on `127.0.0.1:<port>` before any UDP discovery. Local host detection is thus deterministic and network-independent.

**Host LAN address resolution**

The host selects its best IPv4 LAN address by scanning active network interfaces (priority to interfaces with a gateway, excluding tunnels and loopback). The `10.0.0.0/8`, `172.16.0.0/12` and `192.168.0.0/16` ranges are all handled uniformly.

---

## Message envelope (all port 16550 messages)

```json
{
  "ProtocolVersion": 1,
  "MessageType": "GetHostInfoRequest",
  "CorrelationId": "abc123...",
  "SentAtUtc": "2025-01-01T00:00:00.0000000Z",
  ...message-specific fields...
}
```

Responses add `Success`, `ErrorCode`, `ErrorMessage`.

---

## Message types (60+)

### Housekeeping
| MessageType | Description |
|---|---|
| `GetHostInfoRequest/Response` | Host info: HostInfo, Capabilities, MachineInfo, NodeInfo, PrimaryEndpoint |
| `GetHostsRequest/Response` | List of discovered hosts |
| `GetHostSnapshotRequest/Response` | Full runtime snapshot |
| `GetHostSettingsRequest/Response` | Host settings (quality, FPS, brightness, screensaver, network access) |
| `SetCompositeHostSettingsRequest/Response` | Atomic host settings update |
| `GetHostWorkspaceRequest/Response` | Workspace (selected device, page, context) |
| `GetCompositeWorkspaceRequest/Response` | Composite workspace (bindings, subscriptions, render profiles, behavior, layout) |
| `SetHostWorkspaceRequest/Response` | Workspace navigation (DeviceSerial, CurrentPageId, CurrentContext, ValidateOnly) |
| `ExecuteHostCommandRequest/Response` | Host commands (ExportDatabase, ImportDatabase, ResetHostState, ProbeUsbDevice, etc.) |

### Rendering
| MessageType | Description |
|---|---|
| `GetHostRenderPayloadRequest/Response` | Resolves the render payload for a control from a `Route` (`DeviceSerial`, `MainPageId`, `PageId`, `ControlContext`) |
| `RenderHostPreviewRequest/Response` | Preview render (`Route`, `RotationDegrees`; optional `Width`/`Height`, `0` = control native size) → image bytes |
| `RenderHostPreviewBatchRequest/Response` | Batch preview render |
| `SetTransientControlRenderProfileRequest/Response` | Applies a transient render profile for preview, without persisting |
| `RenderDeviceFramesRequest/Response` | Renders frames on the physical device |

### Hardware
| MessageType | Description |
|---|---|
| `GetHardwareCatalogRequest/Response` | Known hardware catalog |
| `GetHardwareInventoryRequest/Response` | USB device inventory |
| `GetHardwareDeviceCapabilitiesRequest/Response` | Detailed per-device capabilities |
| `SetDeviceBrightnessRequest/Response` | Brightness setting |
| `SetDeviceLedRequest/Response` | Per-device LED colors |
| `SetDeviceStartupBackgroundRequest/Response` | Writes the persistent boot background |
| `SetDeviceDiagnosticStateRequest/Response` | Device diagnostic mode |
| `SubscribeHardwareEventsRequest/Response` | Hardware event subscription |
| `UnsubscribeHardwareEventsRequest/Response` | Unsubscribe |

### Control Mappings
| MessageType | Description |
|---|---|
| `GetControlMappingsRequest/Response` | Current mappings |
| `GetControlMappingLayoutRequest/Response` | Devices/pages/controls layout |
| `SetCompositeWorkspaceRequest/Response` | Atomic save of bindings, subscriptions, render profile, behavior and layout |
| `SetControlStaticImageRequest/Response` | Per-control static image assignment |
| `GetMappingCatalogsRequest/Response` | Available mapping catalogs |
| `GetMappingCatalogEntriesRequest/Response` | Entries of a catalog |
| `GetDeviceRoutingRequest/Response` | Device routing (VJoy ID, active page) |
| `SetDeviceRoutingRequest/Response` | Routing update |
| `GetDeviceStateRequest/Response` | Device state |
| `SetDeviceStateRequest/Response` | State update |

### Runtime Providers
| MessageType | Description |
|---|---|
| `GetRuntimeEventsRequest/Response` | Buffered runtime events |
| `GetDisplaySourceStatesRequest/Response` | Display source states by context |
| `GetRuntimeProviderDataRequest/Response` | Runtime data for a provider |
| `SetRuntimeProviderDataRequest/Response` | Runtime provider data write |
| `RegisterRuntimeProviderSessionRequest/Response` | Provider session registration |
| `NotifyRuntimeProviderStateChangedRequest/Response` | Provider state change notification |
| `RuntimeProviderStateChangedEvent` | Push event (events port) |

Runtime rendering notes:
- A `RuntimeFunctionDescriptor` intended for the `Display` editor must publish an explicit `FunctionKind`.
- If `FunctionKind` is omitted, it remains `Unknown` and the Configurator filters the function out of the assignable list, even when `ProviderId`, `FunctionId` and `CatalogKey` are correct.
- In practice, plugins should use `Telemetry` or `HostIntegration` for assignable functions.
- `TitleText` is the only structural header text for normal runtime provider states.
- `HeaderText` should no longer be used by plugins for business runtime functions. States such as `MUTED`, `LIVE`, `REC` or contexts such as `System` should go into metrics or overlays.
- `ShowHeader` is now interpreted host-side as a layout decision tied to the presence of `TitleText`, not as a business channel to show or hide a provider sub-banner.
- `RuntimeStateHint.Warning` and `RuntimeStateHint.Alert` carry a runtime visual semantic:
  - `Warning` = reactive state or visible intervention that should catch the eye without becoming a critical alert
  - `Alert` = more urgent or stronger state than `Warning`
- Quality profiles (`Low`, `Medium`, `High`) do not change this semantic. They only change the richness of the rendering used to express it.

### Profiles
| MessageType | Description |
|---|---|
| `GetProfilesRequest/Response` | Profile list |
| `GetProfileMappingsRequest/Response` | Mappings per profile |
| `SetProfileMappingsRequest/Response` | Profile mappings write |
| `DeleteProfileOverrideRequest/Response` | Override removal |
| `GetVehicleProfileLearnedValuesRequest/Response` | Vehicle learned values |

### Plugins & Transports
| MessageType | Description |
|---|---|
| `GetPluginsRequest/Response` | Plugin list (ProviderId, DisplayName, IsAvailable) |
| `GetPluginSettingsRequest/Response` | Settings of a plugin |
| `ApplyPluginSettingsRequest/Response` | Applies a batch of settings with typed JSON values |
| `GetPluginDataRequest/Response` | Plugin data |
| `GetTransportsRequest/Response` | TCP transport list |
| `StartTransportRequest/Response` | Start transport |
| `StopTransportRequest/Response` | Stop transport |

---

## Connector architecture

### Configurator (WinUI 3, net8.0) — standalone
- **JsonRpcClient**: raw length-prefixed TCP → `JsonDocument`
- **HostClient**: typed wrapper over JsonRpcClient, 20+ IPC methods
- **HostSessionService**: connector resolution, UDP discovery, cache
- **HostProviderEventsService**: raw TCP events client on port+1
- All DTOs are local (`Models/Contracts/`), identical to the `JIB.Sdk` types (same field names = JSON compatibility)

### SimHub Plugin (net48, WPF) — already standalone
- **PluginTcpClient**: raw line-delimited TCP, persistent connection, auto-reconnect
- Raw JSON via Newtonsoft.Json JObject, no shared type

### Host (JIB.Service, net8.0) + internal plugins
- JIB.Sdk used internally only
- IHostConnector removed
- JIB.Connectors removed
- DeviceHostServer handles the 3 TCP listeners + UDP beacon

---

## Adding a future external plugin

Pattern to follow (cf. SimHub.JIB.Plugin):

1. Raw TCP client (line-delimited JSON, dedicated port)
2. Handshake + heartbeat
3. Zero reference to JIB.Sdk (DTO contracts duplicated locally, or JSON built/parsed manually)
4. JSON built/parsed manually (Newtonsoft.Json JObject or System.Text.Json JsonDocument)
