import { EnvVarDefinition } from './types';

export const CONF_PARAMS: Record<string, EnvVarDefinition> = {

    'LOG_LEVEL': {
        type: 'enum',
        description: 'Logging level',
        defaultValue: 'INFO',
        options: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        validation: /^(DEBUG|INFO|WARN|ERROR)$/i,
        required: false
    },

    'COT_URL': {
        type: 'url',
        description: 'URL of the CoT destination, typically Mesh SA or TAK Server',
        defaultValue: 'udp+wo://239.2.3.1:6969',
        validation: /^(udp\+wo|http|https|udp|tcp|tls|file|log|tcp\+wo|udp\+broadcast):\/\/[^\s]+$/,
        requiresQuoting: false,
        required: true
    },

    'SENSOR_ID': {
        type: 'string',
        description: 'Unique Sensor ID for this source.',   
        defaultValue: 'Unknown-Sensor-Id',
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'SENSOR_PAYLOAD_TYPE': {
        type: 'string',
        description: 'Sensor Payload Type, used to identify the type of sensor data being sent',
        defaultValue: 'Uknown-Sensor-Payload-Type',
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'SENSOR_COT_TYPE': {
        type: 'string',
        description: 'Sensor CoT Type, used to categorize the sensor data in the CoT messages',
        defaultValue: 'a-f-G-E-S-E',  
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'OP_COT_TYPE': {
        type: 'string',
        description: 'Operator CoT Type, used to categorize the operator in the CoT messages',
        defaultValue: 'a-u-G',  
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'UAS_COT_TYPE': {
        type: 'string',
        description: 'UAS CoT Type, used to categorize the UAS in the CoT messages',
        defaultValue: 'a-u-A-M-H-Q',
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'HOME_COT_TYPE': {
        type: 'string', 
        description: 'Home CoT Type, used to categorize the home location in the CoT messages',
        defaultValue: 'a-u-G',
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'MQTT_BROKER': {
        type: 'string',
        description: 'MQTT Broker address (hostname or IP address)',
        defaultValue: 'localhost',
        requiresQuoting: false,
        required: false
    },

    'MQTT_PORT': {
        type: 'number',
        description: 'MQTT Broker port',
        defaultValue: '1883',
        validation: /^\d+$/,
        required: false
    },

    'MQTT_TOPIC': {
        type: 'string',
        description: 'MQTT Topic to subscribe to for receiving aircraft position data',
        defaultValue: 'aircraft/positions',
        requiresQuoting: false,
        required: false
    },
    'MQTT_USERNAME': {
        type: 'string',
        description: 'Username for MQTT Broker authentication, if required',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },
    'MQTT_PASSWORD': {
        type: 'string',
        description: 'Password for MQTT Broker authentication, if required',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    'MQTT_CLIENT_ID': {
        type: 'string',
        description: 'Client ID to use when connecting to the MQTT Broker',
        defaultValue: 'pyTAK-mqtt-bridge',
        requiresQuoting: false,
        required: false
    },

    'MQTT_TLS_CLIENT_CERT': {
        type: 'path',
        description: 'Path to client certificate file for TLS connection to the MQTT Broker, if required',
        defaultValue: '',
        validation: /^\/[\w\-\/\.]*$/,
        requiresQuoting: false,
        required: false
    },

    'MQTT_TLS_CLIENT_KEY': {
        type: 'path',
        description: 'Path to client key file for TLS connection to the MQTT Broker, if required',
        defaultValue: '',
        validation: /^\/[\w\-\/\.]*$/,
        requiresQuoting: false,
        required: false
    },

    'EXTRA_ARGS': {
        type: 'string',
        description: 'Additional command line arguments (NOT IMPLEMENTED YET)',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    // PyTAK TLS Configuration
    "PYTAK_TLS_CLIENT_CERT": {
        type: 'path',
        description: 'Path to the TLS client certificate file, if required',
        defaultValue: '',
        validation: /^\/[\w\-\/\.]*$/,
        requiresQuoting: false,
        required: false
    },

    "PYTAK_TLS_CLIENT_KEY": {
        type: 'path',
        description: 'Path to the TLS client key file, if required',
        defaultValue: '',
        validation: /^\/[\w\-\/\.]*$/,
        requiresQuoting: false,
        required: false
    },

    "PYTAK_TLS_CLIENT_PASSWORD": {
        type: 'string',
        description: 'Password for the TLS client certificate, if required',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    "PYTAK_TLS_CLIENT_CAFILE": {
        type: 'path',
        description: 'Path to the CA file for TLS connections, if required',
        defaultValue: '',
        validation: /^\/[\w\-\/\.]*$/,
        requiresQuoting: false,
        required: false

    },

    "PYTAK_TLS_CLIENT_CIPHERS": {
        type: 'string',
        description: 'Ciphers to use for TLS connections, if required',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    "PYTAK_TLS_DONT_CHECK_HOSTNAME": {
        type: 'boolean',
        description: 'Disable hostname verification for TLS connections',
        defaultValue: 'false',
        validation: /^(true|false|yes|no|1|0)$/i,
        required: false
    },
    "PYTAK_TLS_DONT_VERIFY": {
        type: 'boolean',
        description: 'Disable TLS certificate verification',
        defaultValue: 'false',
        validation: /^(true|false|yes|no|1|0)$/i,
        required: false
    },
    "PYTAK_TLS_SERVER_EXPECTED_HOSTNAME": {
        type: 'string',
        description: 'Expected hostname for the TLS server, used for verification',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },
    "PYTAK_TLS_CERT_ENROLLMENT_USERNAME": {
        type: 'string',
        description: 'Username for TLS certificate enrollment',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },
    "PYTAK_TLS_CERT_ENROLLMENT_PASSWORD": {
        type: 'string',
        description: 'Password for TLS certificate enrollment',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },
    "PYTAK_TLS_CERT_ENROLLMENT_PASSPHRASE": {
        type: 'string',
        description: 'Passphrase for the TLS certificate enrollment, if required',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    "COT_ACCESS": {
        type: 'enum',
        description: 'CoT Access level for the messages',
        defaultValue: 'public',
        options: ['public', 'restricted', 'private'],
        validation: /^(public|restricted|private)$/i,
        required: false
    },

    // CoT Event Type and Icon Configuration
    'COT_STALE': {
        type: 'number',
        description: 'CoT Stale period ("timeout"), in seconds',
        defaultValue: '',
        validation: /^\d+$/,
        required: false
    },

    'COT_TYPE': {
        type: 'string',
        description: 'Override COT Event Type ("marker type")',
        defaultValue: '',
        validation: /^[a-zA-Z0-9\-_]+$/,
        requiresQuoting: false,
        required: false
    },

    'COT_ICON': {
        type: 'string',
        description: 'Set a custom user icon / custom marker icon in TAK. Contains a Data Package UUID and resource name (file name)',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },
    
    "COT_CAVEAT": {
        type: 'string',
        description: 'CoT Caveat for the messages, used to indicate special conditions',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    "COT_RELTO": {
        type: 'string',
        description: 'CoT RelTo attribute, used to specify the relationship to other messages',
        defaultValue: '',
        requiresQuoting: false,
        required: false
    },

    "COT_QOS": {
        type: 'enum',
        description: 'CoT Quality of Service level for the messages',
        defaultValue: 'standard',
        options: ['standard', 'high', 'low'],
        validation: /^(standard|high|low)$/i,
        required: false
    },

    "COT_OPEX": {
        type: 'boolean',
        description: 'Indicates if the CoT message is for operational use',
        defaultValue: 'false',
        validation: /^(true|false|yes|no|1|0)$/i,
        required: false
    }
};