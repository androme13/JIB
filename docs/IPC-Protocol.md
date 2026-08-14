# Protocole IPC JSON — JIB DeviceHost

## Wire format

### Configurateur ↔ Host (port 16550)
Binary length-prefixed JSON, une requête par connexion TCP.

```
[4 bytes: Int32 little-endian payload length][N bytes: UTF-8 JSON]
```

### Host → Configurateur events (port 16550 + 1, loopback)
Même format length-prefixed, push-only. Flux continu de `RuntimeProviderStateChangedEvent`.

Handshake d’abonnement :
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

`ClientName`, `ClientHostName`, `ClientProcessId`, `ClientVersion` et `ClientSessionId` sont optionnels au niveau protocole, mais utilisés par le host pour journaliser proprement les connexions Configurator persistantes.

### SimHub Plugin ↔ Host (port 16555)
Line-delimited JSON (`StreamWriter.WriteLine` / `StreamReader.ReadLine`), connexion persistante avec handshake + heartbeat.

Handshake :
```
→ {"Handshake":"JIB.SimHub.Plugin","Version":"1.0"}
← {"Handshake":"OK","ProviderId":"simhub-channel"}
```

Heartbeat : ping/pong toutes les 5s.

### Discovery (UDP port 16551)

**Mode principal — Request/Reply actif**

Le Configurateur ouvre un socket UDP éphémère (port 0), envoie un `DiscoverRequest` en broadcast sur le port 16551, puis collecte les réponses unicast pendant une fenêtre de 1.5 s. Les réponses sont dédupliquées par `host:port`.

```
Query  → {"MessageType":"DiscoverRequest"}
Reply  ← {"Service":"JIB.DeviceHost","Host":"<LAN-IP>","Port":16550,"Version":"1.0"}
```

**Mode secondaire — Beacon périodique**

Le host envoie un beacon broadcast toutes les 2 secondes. Ce signal reste disponible comme complément passif mais la découverte du Configurateur ne dépend plus de lui.

```
Beacon → {"Service":"JIB.DeviceHost","Host":"<LAN-IP>","Port":16550,"Version":"1.0"}
```

**Fast-path local**

Si le fichier `%TEMP%\JIB.Service.port` (JSON `{"Port":<tcpPort>}`) existe, le Configurateur tente une connexion TCP directe sur `127.0.0.1:<port>` avant toute découverte UDP. La détection du host local est ainsi déterministe et indépendante du réseau.

**Résolution d'adresse LAN du host**

Le host sélectionne sa meilleure adresse IPv4 LAN en parcourant les interfaces réseau actives (priorité aux interfaces avec passerelle, exclusion des tunnels et loopback). Les plages `10.0.0.0/8`, `172.16.0.0/12` et `192.168.0.0/16` sont toutes traitées de façon uniforme.

---

## Enveloppe de message (tous les messages port 16550)

```json
{
  "ProtocolVersion": 1,
  "MessageType": "GetHostInfoRequest",
  "CorrelationId": "abc123...",
  "SentAtUtc": "2025-01-01T00:00:00.0000000Z",
  ...champs spécifiques au message...
}
```

Réponses ajoutent `Success`, `ErrorCode`, `ErrorMessage`.

---

## Types de messages (60+)

### Housekeeping
| MessageType | Description |
|---|---|
| `GetHostInfoRequest/Response` | Infos hôte : HostInfo, Capabilities, MachineInfo, NodeInfo, PrimaryEndpoint |
| `GetHostsRequest/Response` | Liste des hôtes découverts |
| `GetHostSnapshotRequest/Response` | Snapshot runtime complet |
| `GetHostSettingsRequest/Response` | Settings host (qualité, FPS, brightness, screensaver, accès réseau) |
| `SetCompositeHostSettingsRequest/Response` | Mise à jour atomique des host settings |
| `GetHostWorkspaceRequest/Response` | Workspace (device sélectionné, page, contexte) |
| `GetCompositeWorkspaceRequest/Response` | Workspace composite (bindings, subscriptions, render profiles, behavior, layout) |
| `SetHostWorkspaceRequest/Response` | Navigation workspace (DeviceSerial, CurrentPageId, CurrentContext, ValidateOnly) |
| `ExecuteHostCommandRequest/Response` | Commandes host (ExportDatabase, ImportDatabase, ResetHostState, ProbeUsbDevice, etc.) |

### Rendering
| MessageType | Description |
|---|---|
| `GetHostRenderPayloadRequest/Response` | Résout le payload de rendu pour un contrôle à partir d'une `Route` (`DeviceSerial`, `MainPageId`, `PageId`, `ControlContext`) |
| `RenderHostPreviewRequest/Response` | Rendu preview (`Route`, `RotationDegrees`; `Width`/`Height` optionnels, `0` = taille native du contrôle) → image bytes |
| `RenderHostPreviewBatchRequest/Response` | Rendu preview par lots |
| `SetTransientControlRenderProfileRequest/Response` | Applique un render profile transient pour la preview, sans persistance |
| `RenderDeviceFramesRequest/Response` | Rendu frames sur device physique |

### Hardware
| MessageType | Description |
|---|---|
| `GetHardwareCatalogRequest/Response` | Catalogue hardware connu |
| `GetHardwareInventoryRequest/Response` | Inventaire devices USB |
| `GetHardwareDeviceCapabilitiesRequest/Response` | Capacités détaillées par device |
| `SetDeviceBrightnessRequest/Response` | Réglage luminosité |
| `SetDeviceLedRequest/Response` | Couleurs LED par device |
| `SetDeviceStartupBackgroundRequest/Response` | Écriture du fond d'écran de boot persistant |
| `SetDeviceDiagnosticStateRequest/Response` | Mode diagnostic device |
| `SubscribeHardwareEventsRequest/Response` | Souscription événements hardware |
| `UnsubscribeHardwareEventsRequest/Response` | Désabonnement |

### Control Mappings
| MessageType | Description |
|---|---|
| `GetControlMappingsRequest/Response` | Mappings actuels |
| `GetControlMappingLayoutRequest/Response` | Layout devices/pages/controls |
| `SetCompositeWorkspaceRequest/Response` | Sauvegarde atomique des bindings, subscriptions, render profile, behavior et layout |
| `SetControlStaticImageRequest/Response` | Affectation d'une image statique par contrôle |
| `GetMappingCatalogsRequest/Response` | Catalogues de mappings disponibles |
| `GetMappingCatalogEntriesRequest/Response` | Entrées d'un catalogue |
| `GetDeviceRoutingRequest/Response` | Routage device (VJoy ID, page active) |
| `SetDeviceRoutingRequest/Response` | MAJ routage |
| `GetDeviceStateRequest/Response` | État device |
| `SetDeviceStateRequest/Response` | MAJ état |

### Runtime Providers
| MessageType | Description |
|---|---|
| `GetRuntimeEventsRequest/Response` | Événements runtime bufferisés |
| `GetDisplaySourceStatesRequest/Response` | États des sources d'affichage par contexte |
| `GetRuntimeProviderDataRequest/Response` | Données runtime d'un provider |
| `SetRuntimeProviderDataRequest/Response` | Écriture de données runtime provider |
| `RegisterRuntimeProviderSessionRequest/Response` | Enregistrement session provider |
| `NotifyRuntimeProviderStateChangedRequest/Response` | Notification changement état provider |
| `RuntimeProviderStateChangedEvent` | Push event (port events) |

Notes de rendu runtime :
- Une `RuntimeFunctionDescriptor` destinée à l’éditeur `Display` doit publier un `FunctionKind` explicite.
- Si `FunctionKind` est omis, il reste à `Unknown` et le Configurateur filtre la fonction hors de la liste assignable, même si `ProviderId`, `FunctionId` et `CatalogKey` sont corrects.
- En pratique, les plugins doivent utiliser `Telemetry` ou `HostIntegration` pour les fonctions assignables.
- `TitleText` est le seul texte structurel de tête pour les états runtime provider normaux.
- `HeaderText` ne doit plus être utilisé par les plugins pour les fonctions runtime métiers. Les états comme `MUTED`, `LIVE`, `REC` ou les contextes comme `System` doivent aller dans les métriques ou overlays.
- `ShowHeader` est désormais interprété côté host comme une décision de layout liée à la présence du `TitleText`, pas comme un canal métier pour afficher ou masquer un sous-bandeau provider.
- `RuntimeStateHint.Warning` et `RuntimeStateHint.Alert` portent une sémantique visuelle runtime :
  - `Warning` = état réactif ou intervention visible qui doit attirer l’œil sans devenir une alerte critique
  - `Alert` = état plus urgent ou plus fort que `Warning`
- Les quality profiles (`Low`, `Medium`, `High`) ne changent pas cette sémantique. Ils changent seulement la richesse du rendu utilisé pour l’exprimer.

### Profiles
| MessageType | Description |
|---|---|
| `GetProfilesRequest/Response` | Liste profils |
| `GetProfileMappingsRequest/Response` | Mappings par profil |
| `SetProfileMappingsRequest/Response` | Écriture mappings profil |
| `DeleteProfileOverrideRequest/Response` | Suppression override |
| `GetVehicleProfileLearnedValuesRequest/Response` | Valeurs apprises véhicule |

### Plugins & Transports
| MessageType | Description |
|---|---|
| `GetPluginsRequest/Response` | Liste plugins (ProviderId, DisplayName, IsAvailable) |
| `GetPluginSettingsRequest/Response` | Settings d'un plugin |
| `ApplyPluginSettingsRequest/Response` | Appliquer un batch de settings avec valeurs JSON typées |
| `GetPluginDataRequest/Response` | Données plugin |
| `GetTransportsRequest/Response` | Liste transports TCP |
| `StartTransportRequest/Response` | Démarrer transport |
| `StopTransportRequest/Response` | Arrêter transport |

---

## Architecture des connecteurs

### Configurateur (WinUI 3, net8.0) — autonome
- **JsonRpcClient** : TCP brut length-prefixed → `JsonDocument`
- **HostClient** : wrapper typé au-dessus de JsonRpcClient, 20+ méthodes IPC
- **HostSessionService** : résolution de connecteurs, découverte UDP, cache
- **HostProviderEventsService** : client events TCP brut sur port+1
- Tous les DTOs sont locaux (`Models/Contracts/`), identiques aux types `JIB.Sdk` (mêmes noms de champs = compatibilité JSON)

### SimHub Plugin (net48, WPF) — déjà autonome
- **PluginTcpClient** : TCP brut line-delimited, connexion persistante, auto-reconnect
- JSON brut via Newtonsoft.Json JObject, aucun type partagé

### Host (JIB.Service, net8.0) + plugins internes
- JIB.Sdk utilisé uniquement en interne
- IHostConnector supprimé
- JIB.Connectors supprimé
- DeviceHostServer gère les 3 listeners TCP + beacon UDP

---

## Ajout d'un futur plugin externe

Pattern à suivre (cf. SimHub.JIB.Plugin) :

1. Client TCP brut (line-delimited JSON, port dédié)
2. Handshake + heartbeat
3. Zéro référence à JIB.Sdk (contrats DTO dupliqués localement, ou JSON construit/déconstruit manuellement)
4. JSON construit/déconstruit manuellement (Newtonsoft.Json JObject ou System.Text.Json JsonDocument)
