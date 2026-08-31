import { type EnvVarDefinition } from '@snstac/cockpit-shared';

import { COMMON_CONF_PARAMS } from './conf';

export type DroneCotInstanceKey = 'dji' | 'dronescout' | 'wifi' | 'ble';

export interface DroneCotInstance {
    key: DroneCotInstanceKey;
    label: string;
    serviceName: string;
    configFile: string;
    config: Record<string, EnvVarDefinition>;
}

const stringField = (description: string, defaultValue = ''): EnvVarDefinition => ({
    type: 'string',
    description,
    defaultValue,
    requiresQuoting: false,
    required: false,
});

const pathOrUrlField = (description: string, defaultValue: string): EnvVarDefinition => ({
    type: 'string',
    description,
    defaultValue,
    validation: /^(serial:\/\/\/dev\/[A-Za-z0-9._:+/-]+:\d+|wifi:\/\/[A-Za-z0-9._:-]+|wireless:\/\/[A-Za-z0-9._:-]+|ble\+hci:\/\/[A-Za-z0-9._:-]+)$/,
    requiresQuoting: false,
    required: true,
});

const instance = (
    key: DroneCotInstanceKey,
    label: string,
    fields: Record<string, EnvVarDefinition>,
): DroneCotInstance => ({
    key,
    label,
    serviceName: `dronecot-${key}`,
    configFile: `/etc/default/dronecot-${key}`,
    config: { ...fields, ...COMMON_CONF_PARAMS },
});

export const DRONECOT_INSTANCES: Record<DroneCotInstanceKey, DroneCotInstance> = {
    dji: instance('dji', 'DJI DroneID / AntSDR', {
        DJI_TCP_PORT: {
            type: 'number',
            description: 'TCP port that receives AntSDR DroneID data.',
            defaultValue: '52002',
            validation: /^\d+$/,
            range: [1, 65535],
            required: true,
        },
        DJI_BIND_ADDRESS: stringField('Local IPv4 address used by the AntSDR link.', '172.31.100.1'),
        DJI_SENSOR_NAME: stringField('Receiver name included with detected tracks.', 'ANTSDR'),
        SENSOR_KEEPALIVE_PERIOD: {
            type: 'number',
            description: 'Seconds between sensor keepalive messages.',
            defaultValue: '30',
            validation: /^\d+$/,
            range: [1, 3600],
            required: false,
        },
    }),
    dronescout: instance('dronescout', 'DroneScout Remote ID', {
        FEED_URL: pathOrUrlField('DroneScout MAVLink serial input.', 'serial:///dev/dronescout:115200'),
        SERIAL_CRLF_NORMALIZE: {
            type: 'boolean',
            description: 'Repair CRLF expansion from supported DroneScout firmware.',
            defaultValue: 'true',
            validation: /^(true|false|yes|no|1|0)$/i,
            required: false,
        },
        SENSOR_ID: stringField('Receiver identifier included with Remote ID tracks.', 'dronescout'),
    }),
    wifi: instance('wifi', 'Wi-Fi Remote ID', {
        FEED_URL: pathOrUrlField('Wi-Fi Remote ID capture input.', 'wifi://wlan1'),
        WIFI_INTERFACE: stringField('External monitor-mode Wi-Fi interface.', 'wlan1'),
        WIFI_HOP_CHANNELS: stringField('Comma-separated Wi-Fi channels.', '1,6,11'),
        WIFI_HOP_DWELL: stringField('Channel dwell timing.', '3,1'),
        SENSOR_ID: stringField('Receiver identifier included with Remote ID tracks.', 'wifi-rid'),
        SENSOR_TYPE: stringField('Receiver capability description.', 'Wi-Fi Open Drone ID'),
        SENSOR_MODEL: stringField('Receiver hardware description.', 'Wi-Fi monitor adapter'),
    }),
    ble: instance('ble', 'Bluetooth Remote ID', {
        FEED_URL: pathOrUrlField('Bluetooth Remote ID capture input.', 'ble+hci://hci0'),
        BLE_ADAPTER: stringField('Bluetooth adapter used for capture.', 'hci0'),
        BLE_READER: {
            type: 'enum',
            description: 'Bluetooth capture method.',
            defaultValue: 'auto',
            options: ['auto', 'monitor', 'dbus'],
            validation: /^(auto|monitor|dbus)$/,
            required: false,
        },
        BLE_RSSI_THRESHOLD: {
            type: 'number',
            description: 'Optional minimum received signal strength in dBm.',
            defaultValue: '',
            validation: /^-?\d+$/,
            range: [-127, 20],
            required: false,
        },
        SENSOR_ID: stringField('Receiver identifier included with Remote ID tracks.', 'ble-rid'),
        SENSOR_TYPE: stringField('Receiver capability description.', 'Bluetooth Open Drone ID'),
        SENSOR_MODEL: stringField('Receiver hardware description.', 'Onboard Bluetooth (BlueZ)'),
    }),
};

export function instanceKeyFromPath(pathname: string): DroneCotInstanceKey {
    const page = pathname.split('/').pop()
            ?.replace(/\.html$/, '') || 'dji';
    if (page === 'dronescout' || page === 'wifi' || page === 'ble')
        return page;
    return 'dji';
}

export function currentInstance(pathname = window.location.pathname): DroneCotInstance {
    return DRONECOT_INSTANCES[instanceKeyFromPath(pathname)];
}
