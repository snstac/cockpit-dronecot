# cockpit-dronecot — Drone Remote ID monitoring & management for TAK, in your browser

A [Cockpit](https://cockpit-project.org/) web console plugin for
[DRONECOT](https://github.com/snstac/dronecot), the **Drone Remote ID to TAK gateway**.
Manage drone detection on a Raspberry Pi or any Debian/RHEL sensor node from a browser:
no SSH, no config-file spelunking.

Detect and track **UAS / drones broadcasting Remote ID** (Bluetooth & WiFi, per
ASTM F3411 / FAA Remote ID) and forward sensor, operator, and aircraft positions as
**Cursor on Target (CoT)** to **ATAK, WinTAK, iTAK, TAK Server, and Mesh SA** —
counter-UAS (C-UAS) situational awareness for public safety, airspace security,
critical infrastructure, and event protection.

## Features

- **Service control** — start/stop/restart the `dronecot` service, live status, journal logs.
- **Configuration editor** — every `/etc/default/dronecot` setting (CoT destination URL,
  sensor ID, CoT types for sensor/operator/UAS, log level) with validation, preserved
  comments, and optional restart-on-save.
- **TAK TLS** — upload client certificate/key/CA (PEM) and wire up the full
  `PYTAK_TLS_*` set for TLS connections to TAK Server.
- Installs as a native Cockpit page: works alongside the rest of your Cockpit admin.

## Install

From the [snstac package repository](https://snstac.github.io/packages) (Debian,
Raspberry Pi OS, Ubuntu):

```sh
sudo curl -fsSL -o /usr/share/keyrings/snstac.gpg https://snstac.github.io/packages/snstac.gpg
sudo curl -fsSL -o /etc/apt/sources.list.d/snstac.sources https://snstac.github.io/packages/snstac.sources
sudo apt update && sudo apt install cockpit-dronecot dronecot
```

Pre-installed on [AryaOS](https://github.com/snstac/aryaos), the situational-awareness
OS for Raspberry Pi.

## The snstac TAK sensor ecosystem

Different sensor, same workflow — each gateway has a matching Cockpit plugin:

| Application | Gateway | Cockpit plugin |
|---|---|---|
| **Drone / UAS Remote ID** (this plugin) | [dronecot](https://github.com/snstac/dronecot) | cockpit-dronecot |
| Aircraft via ADS-B (1090 MHz / 978 MHz UAT) | [adsbcot](https://github.com/snstac/adsbcot) | [cockpit-adsbcot](https://github.com/snstac/cockpit-adsbcot) |
| Ships & vessels via AIS | [aiscot](https://github.com/snstac/aiscot) | [cockpit-aiscot](https://github.com/snstac/cockpit-aiscot), [cockpit-aiscatcher](https://github.com/snstac/cockpit-aiscatcher) |
| Own position via GPS/GNSS | [lincot](https://github.com/snstac/lincot) | [cockpit-lincot](https://github.com/snstac/cockpit-lincot), [cockpit-gps](https://github.com/snstac/cockpit-gps) |
| Radio direction finding (KrakenSDR) | [kraktak](https://github.com/snstac/kraktak) | — |
| APRS amateur radio | [aprscot](https://github.com/snstac/aprscot) | — |
| Weather stations | [windtak](https://github.com/snstac/windtak) | — |
| CoT routing / TAK Server bridging | [charontak](https://github.com/snstac/charontak) | — |

All gateways are built on [PyTAK](https://github.com/snstac/pytak) and published as
signed Debian/RPM packages at [snstac.github.io/packages](https://snstac.github.io/packages).

## Development

```sh
make            # build into dist/
sudo make install
make watch      # rebuild on change (~/.local/share/cockpit/dronecot)
```

Built from the [Cockpit starter kit](https://github.com/cockpit-project/starter-kit)
(React + PatternFly + esbuild); packaged with nfpm (deb + rpm) on tag push.

# License & Copyright

Copyright [Sensors & Signals LLC](https://www.snstac.com)

Licensed under the Apache License, Version 2.0.
