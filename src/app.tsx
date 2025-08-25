/*
 * Copyright Sensors & Signals LLC https://www.snstac.com/
 */

import React, { useEffect, useState } from 'react';
import { Alert } from "@patternfly/react-core/dist/esm/components/Alert/index.js";
import {
    DataList,
    DataListItem,
    DataListItemRow,
    DataListItemCells,
    DataListCell
} from "@patternfly/react-core/dist/esm/components/DataList/index.js";
import { Card, CardBody, CardTitle } from "@patternfly/react-core/dist/esm/components/Card/index.js";

import {
  Checkbox,
  Dropdown,
  DropdownList,
  DropdownItem,
  Divider,
  MenuToggle,
  MenuToggleElement,
  CardExpandableContent,
  CardHeader,
  CardFooter

} from '@patternfly/react-core';
import EllipsisVIcon from '@patternfly/react-icons/dist/esm/icons/ellipsis-v-icon';


import cockpit from 'cockpit';
import { capitalize } from '@patternfly/react-core';
import { CONF_PARAMS } from './conf';  
import { EnvVarData } from './types';

const _ = cockpit.gettext;


export const Application: React.FC = () => {
    // Configuration
    const SERVICE_NAME = 'adsbcot'; // Change this to your service name
    const CONFIG_FILE = `/etc/default/${SERVICE_NAME}`;

    const [isDebugExpanded, setIsDebugExpanded] = useState<boolean>(false);
    const [isConfigExpanded, setIsConfigExpanded] = useState<boolean>(false);


    let originalContent: string = '';
    let environmentVars: Map<string, EnvVarData> = new Map();
    let fileStructure: FileStructureItem[] = []; // Preserves original file structure including comments
    let statusUpdateInterval: number | null = null;
    let logFollowProcess: any = null;


    type FileStructureItem = 
        | { type: 'comment'; content: string; lineNumber: number }
        | { type: 'variable'; name: string; lineNumber: number };


    useEffect(() => {
        let watcher: any = null;

        // Function to read and update config file contents
        const updateConfigFileContents = async () => {
            try {
                const content = await cockpit.file(CONFIG_FILE, { superuser: "try"}).read();
                setConfigFileContents(content);
            } catch (err) {
                setConfigFileContents(_("Failed to read configuration file: {error}.").replace("{error}", err.message));
            }
        };

        // Start watching the config file for changes
        watcher = cockpit.file(CONFIG_FILE).watch(updateConfigFileContents);

        // Initial read
        updateConfigFileContents();

        return () => {
            if (watcher && watcher.close) watcher.close();
        };
    }, []);

    const [configFileContents, setConfigFileContents] = useState<string>("");

    // Add state for the CONF_PARAMS form
    const [envVarForm, setEnvVarForm] = useState<Record<string, string>>(
        Object.fromEntries(
            Object.entries(CONF_PARAMS).map(([key, def]) => [key, def.defaultValue])
        )
    );
    
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        async function readConfigFileAndPopulateForm() {
            try {
                const content = await cockpit.file(CONFIG_FILE, { superuser: "try" }).read();
                setConfigFileContents(content);

                // Parse config file lines
                const lines = content.split('\n');
                const newForm: Record<string, string> = { ...envVarForm };
                for (const line of lines) {
                    // Ignore comments and empty lines
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith('#')) continue;
                    const match = trimmed.match(/^([A-Za-z0-9_]+)=(.*)$/);
                    if (match) {
                        let [, key, value] = match;
                        // Remove quotes if present
                        value = value.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');
                        if (key in CONF_PARAMS) {
                            newForm[key] = value;
                        }
                    }
                }
                setEnvVarForm(newForm);
            } catch (err) {
                // Ignore error, configFileContents already set by other effect
            }
        }
        readConfigFileAndPopulateForm();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [configFileContents]);


    // Validation helper
    function validateField(key: string, value: string): string {
        const def = CONF_PARAMS[key];
        // Skip validation if not required and value is empty
        if (def.required === false && (value === "" || value == null)) {
            return "";
        }
        if (def.validation && !def.validation.test(value)) {
            return _("Invalid value");
        }
        if (def.type === "number" && def.range) {
            const num = Number(value);
            if (isNaN(num) || num < def.range[0] || num > def.range[1]) {
                return _("Value must be between ") + def.range[0] + " and " + def.range[1];
            }
        }
        if (def.type === "enum" && def.options && !def.options.includes(value)) {
            return _("Invalid option");
        }
        return "";
    }

    // Handle form change
    
    function handleEnvVarChange(key: string, value: string) {
        setEnvVarForm(prev => ({ ...prev, [key]: value }));
        setFormErrors(prev => ({ ...prev, [key]: validateField(key, value) }));
    }

    
    function renderEnvVarForm2(): React.JSX.Element {
        return (
            <form onSubmit={handleEnvVarFormSubmit}>
                <DataList aria-label={_("Environment Variable Configuration")}>
                    {Object.entries(CONF_PARAMS).map(([key, def]) => (
                        <DataListItem key={key} aria-labelledby={`envvar-${key}`}>
                            <DataListItemRow>
                                <DataListItemCells
                                    dataListCells={[
                                        <DataListCell key="label">
                                            <label htmlFor={`envvar-input-${key}`}>
                                                <strong>{key}</strong>
                                                {def.required && (
                                                    <span style={{ color: "red", marginLeft: 8 }}>
                                                        {_("Required")}
                                                    </span>
                                                )}
                                                <div style={{ fontSize: "0.95em", color: "#888" }}>
                                                    {def.description}
                                                </div>
                                                <div style={{ fontSize: "smaller", color: "#888" }}>
                                                    {_("Default")}: <code>{def.defaultValue}</code>
                                                    {def.type === "number" && def.range
                                                        ? ` (${_("Range")}: ${def.range[0]} - ${def.range[1]})`
                                                        : ""}
                                                    {def.type === "enum" && def.options
                                                        ? ` (${_("Options")}: ${def.options.join(", ")})`
                                                        : ""}
                                                </div>
                                            </label>
                                        </DataListCell>,
                                        <DataListCell key="input">
                                            {def.type === "boolean" ? (
                                                <select
                                                    id={`envvar-input-${key}`}
                                                    value={envVarForm[key]}
                                                    onChange={e => handleEnvVarChange(key, e.target.value)}
                                                >
                                                    <option value="true">{_("True")}</option>
                                                    <option value="false">{_("False")}</option>
                                                </select>
                                            ) : def.type === "enum" && def.options ? (
                                                <select
                                                    id={`envvar-input-${key}`}
                                                    value={envVarForm[key]}
                                                    onChange={e => handleEnvVarChange(key, e.target.value)}
                                                >
                                                    {def.options.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input
                                                    id={`envvar-input-${key}`}
                                                    type={def.type === "number" ? "number" : "text"}
                                                    value={envVarForm[key]}
                                                    min={def.type === "number" && def.range ? def.range[0] : undefined}
                                                    max={def.type === "number" && def.range ? def.range[1] : undefined}
                                                    onChange={e => handleEnvVarChange(key, e.target.value)}
                                                    style={{ width: "300px", fontFamily: "monospace" }}
                                                />
                                            )}
                                            {formErrors[key] && (
                                                <div style={{ color: "red" }}>{formErrors[key]}</div>
                                            )}
                                        </DataListCell>
                                    ]}
                                />
                            </DataListItemRow>
                        </DataListItem>
                    ))}
                </DataList>
                <button type="submit" className="pf-c-button pf-m-primary" style={{ marginTop: "1em", marginBottom: "10em" }}>
                    {_("Validate & Save")}
                </button>
            </form>
        );
    }

    // Handle form submit
    function handleEnvVarFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Validate all fields
        const errors: Record<string, string> = {};
        for (const key of Object.keys(CONF_PARAMS)) {
            const err = validateField(key, envVarForm[key]);
            if (err) errors[key] = err;
        }
        setFormErrors(errors);
        if (Object.keys(errors).length === 0) {
            alert(_("All values are valid."));
            
            // You could add logic here to update configFileContents, etc.
            // Example: update the config file with the validated values
            const newConfig = Object.entries(envVarForm)
                .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
                .join('\n');

            cockpit.file(CONFIG_FILE, { superuser: "try" }).replace(newConfig)
                .then(() => {
                    setConfigFileContents(newConfig);
                    alert(_("Configuration file updated successfully."));
                })
                .catch((err) => {
                    alert(_("Failed to update configuration file: ") + err.message);
                });
        }
    }

    function ServiceStatus({ serviceName }: { serviceName: string }) {
        const [status, setStatus] = useState<string | null>(null);
        const [error, setError] = useState<string | null>(null);
        useEffect(() => {
            let cancelled = false;
            async function fetchStatus() {
                try {
                    const result = await cockpit
                        .dbus("org.freedesktop.systemd1", {
                            superuser: "try",
                        })
                        .call(
                            "/org/freedesktop/systemd1/unit/" +
                                serviceName.replace(/-/g, "_") +
                                "_2eservice",
                            "org.freedesktop.DBus.Properties",
                            "Get",
                            ["org.freedesktop.systemd1.Unit", "ActiveState"]
                        );
                    if (!cancelled) {
                        setStatus(result[0]?.v || "unknown");
                        setError(null);
                    }
                } catch (e: any) {
                    if (!cancelled) {
                        setError(_("Failed to get service status."));
                        setStatus(null);
                    }
                }
            }
            fetchStatus();
            const interval = setInterval(fetchStatus, 4000);
            return () => {
                cancelled = true;
                clearInterval(interval);
            };
        }, [serviceName]);

        if (error) {
            return <Alert variant="danger" title={error} />;
        }
        if (!status) {
            return <span>{_("Loading...")}</span>;
        }
        let color = "gray";
        if (status === "active") color = "green";
        else if (status === "inactive") color = "red";
        else if (status === "failed") color = "darkred";
        return (
            <span>
                <span
                    style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        background: color,
                        marginRight: 8,
                        verticalAlign: "middle",
                    }}
                />
                {capitalize(status)}
            </span>
        );
    }

    function renderServiceControlButton(
        action: string,
        label: string,
        className: string
    ): React.ReactNode {
        return (
            <button
                className={`pf-c-button ${className}`}
                type="button"
                onClick={async () => {
                    try {
                        await cockpit.spawn(["systemctl", action, SERVICE_NAME], { superuser: "try" });
                        if (action === "enable" || action === "disable") {
                            alert(_(`Service ${label.toLowerCase()}ed.`));
                        }
                    } catch (e) {
                        alert(_(`Failed to ${label.toLowerCase()} service.`));
                    }
                }}
            >
                {label}
            </button>
        );
    }

    const [logsOutput, setLogsOutput] = useState<string>("");

    function showServiceLogs(): void {
        cockpit
            .spawn(["journalctl", "-u", SERVICE_NAME, "--no-pager", "--since", "today"], { superuser: "try" })
            .then((output: string) => {
                setLogsOutput(output || _("No logs found for this service."));
            })
            .catch(() => {
                setLogsOutput(_("Failed to retrieve service logs."));
            });
    }

    function stopFollowingLogs(): void {
        if (logFollowProcess && typeof logFollowProcess.close === "function") {
            logFollowProcess.close();
            logFollowProcess = null;
            setLogsOutput(_("Stopped following logs."));
        } else {
            setLogsOutput(_("Not currently following logs."));
        }
    }

    function followServiceLogs(): void {
        if (logFollowProcess) {
            setLogsOutput(_("Already following logs."));
            return;
        }
        setLogsOutput(""); // Clear previous logs
        logFollowProcess = cockpit.spawn(
            ["journalctl", "-u", SERVICE_NAME, "-f", "--no-pager"],
            { superuser: "try" }
        );
        logFollowProcess.stream((data: string) => {
            setLogsOutput(prev => prev + data);
        });
        logFollowProcess.done(() => {
            logFollowProcess = null;
        });
        logFollowProcess.fail(() => {
            setLogsOutput(_("Failed to follow logs."));
            logFollowProcess = null;
        });
    }

    function StatusOutput({ serviceName }: { serviceName: string }): React.JSX.Element {
        const [statusOutput, setStatusOutput] = React.useState<string>("Loading...");
        React.useEffect(() => {
            let cancelled = false;
            async function fetchStatus() {
                try {
                    const out = await cockpit.spawn(
                        ["systemctl", "status", serviceName, "--no-pager"],
                        { superuser: "try" }
                    );
                    if (!cancelled) setStatusOutput(out);
                } catch {
                    if (!cancelled) setStatusOutput(_("Failed to get status output."));
                }
            }
            fetchStatus();
            const interval = setInterval(fetchStatus, 4000);
            return () => {
                cancelled = true;
                clearInterval(interval);
            };
        }, [serviceName]);
        return (
            <pre
                style={{
                    background: "#222",
                    color: "#eee",
                    padding: "1em",
                    borderRadius: "4px",
                    fontSize: "0.95em",
                    overflowX: "auto",
                    maxHeight: 300,
                }}
            >
                {statusOutput}
            </pre>
        );
    }

    {/* Automatically show and follow logs on mount */}
    {React.useEffect(() => {
        showServiceLogs();
        followServiceLogs();
        // Optionally, clean up on unmount
        return () => {
            stopFollowingLogs();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])}


    // Fetch service docs link and description from systemd unit metadata
    function renderServiceDocsLink(serviceName: string): JSX.Element {
        const [docsUrl, setDocsUrl] = React.useState<string | null>(null);

        React.useEffect(() => {
            let cancelled = false;
            async function fetchDocsUrl() {
                try {
                    // Try to get the Documentation property from systemd unit
                    const result = await cockpit
                        .dbus("org.freedesktop.systemd1", { superuser: "try" })
                        .call(
                            "/org/freedesktop/systemd1/unit/" +
                                serviceName.replace(/-/g, "_") +
                                "_2eservice",
                            "org.freedesktop.DBus.Properties",
                            "Get",
                            ["org.freedesktop.systemd1.Unit", "Documentation"]
                        );
                    if (!cancelled) {
                        // Documentation can be an array or string
                        let doc = result[0]?.v;
                        if (Array.isArray(doc) && doc.length > 0) doc = doc[0];
                        setDocsUrl(typeof doc === "string" && doc ? doc : null);
                    }
                } catch {
                    if (!cancelled) setDocsUrl(null);
                }
            }
            fetchDocsUrl();
            return () => {
                cancelled = true;
            };
        }, [serviceName]);

        const url =
            docsUrl ||
            `https://www.google.com/search?q=${encodeURIComponent(serviceName + " documentation")}`;
        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                {_("Online Documentation")}
            </a>
        );
    }

    function renderServiceDescription(serviceName: string): React.ReactNode {
        const [description, setDescription] = React.useState<string | null>(null);

        React.useEffect(() => {
            let cancelled = false;
            async function fetchDescription() {
                try {
                    const result = await cockpit
                        .dbus("org.freedesktop.systemd1", { superuser: "try" })
                        .call(
                            "/org/freedesktop/systemd1/unit/" +
                                serviceName.replace(/-/g, "_") +
                                "_2eservice",
                            "org.freedesktop.DBus.Properties",
                            "Get",
                            ["org.freedesktop.systemd1.Unit", "Description"]
                        );
                    if (!cancelled) {
                        setDescription(result[0]?.v || null);
                    }
                } catch {
                    if (!cancelled) setDescription(null);
                }
            }
            fetchDescription();
            return () => {
                cancelled = true;
            };
        }, [serviceName]);

        return (
            <span>
                {description || _("No description available for this service.")}
            </span>
        );
    }

    // Dummy headerActions and isToggleRightAligned for CardHeader props
    const headerActions = undefined;
    const isCardToggleRightAligned = false;

    
    // State for Advanced Details card expansion
    const [isAdvancedDetailsExpanded, setIsAdvancedDetailsExpanded] = useState<boolean>(false);

    // Add this component inside your Application component's return statement
    return (
        <>
            {/* Header Card */}
            <Card>
                <CardTitle>{renderServiceDescription(SERVICE_NAME)}</CardTitle>

                { /* Status, Control & Docs Card */ }
                <CardBody>

                    <CardTitle><ServiceStatus serviceName={SERVICE_NAME} /></CardTitle>

                    <CardTitle>
                    <div style={{ display: "flex", gap: "1em", flexWrap: "wrap" }}>
                        {renderServiceControlButton("start", _("Start"), "pf-m-primary")}
                        {renderServiceControlButton("stop", _("Stop"), "pf-m-secondary")}
                        {renderServiceControlButton("restart", _("Restart"), "pf-m-secondary")}
                        {/* {renderServiceControlButton("reload", _("Reload"), "pf-m-secondary")} */}
                        {renderServiceControlButton("enable", _("Enable"), "pf-m-secondary")}
                        {renderServiceControlButton("disable", _("Disable"), "pf-m-secondary")}
                    </div>
                    </CardTitle>

                    <CardTitle>{renderServiceDocsLink(SERVICE_NAME)}</CardTitle>
                </CardBody>
            </Card>

            {/* Configuration Card */}
            <Card style={{ overflowY: "scroll", maxHeight: "calc(100vh - 200px)" }} isExpanded={isConfigExpanded}>
                <CardHeader
                    className="ct-card-expandable-header"
                    onExpand={() => setIsConfigExpanded(!isConfigExpanded)} 
                    toggleButtonProps={{
                        id: 'expandable-card-toggle',
                        'aria-label': isConfigExpanded ? _('Collapse details') : _('Expand details'),
                    }}
                    isToggleRightAligned={isCardToggleRightAligned}
                >
                    <CardTitle>{_("Configuration")}</CardTitle>
                </CardHeader>

                <CardExpandableContent>
                    {renderEnvVarForm2()}
                </CardExpandableContent>

            </Card>

            {/* Debug Card */}
            <Card isExpanded={isDebugExpanded}>
                <CardHeader
                    className="ct-card-expandable-header"
                    onExpand={() => setIsDebugExpanded(!isDebugExpanded)} 
                    toggleButtonProps={{
                        id: 'expandable-card-toggle',
                        'aria-label': isDebugExpanded ? _('Collapse details') : _('Expand details'),
                    }}
                    isToggleRightAligned={isCardToggleRightAligned}
                >
                    <CardTitle>{_("Debug Logs")}</CardTitle>
                </CardHeader>
                <CardExpandableContent>
                        <CardTitle>{_("Status Output")}</CardTitle>
                        <StatusOutput serviceName={SERVICE_NAME} />

                        <CardTitle>{_("Service Logs")}</CardTitle>
                        <div style={{ display: "flex", gap: "1em", flexWrap: "wrap", marginBottom: "1em" }}>
                            <button
                                className="pf-c-button pf-m-primary"
                                onClick={() => showServiceLogs()}
                            >
                                {_('Show Logs')}
                            </button>
                            <button
                                className="pf-c-button pf-m-secondary"
                                onClick={() => followServiceLogs()}
                            >
                                {_('Follow Logs')}
                            </button>
                            <button
                                className="pf-c-button pf-m-secondary"
                                onClick={() => stopFollowingLogs()}
                            >
                                {_('Stop Following')}
                            </button>
                        </div>
                        <pre
                            style={{
                                background: "#222",
                                color: "#eee",
                                padding: "1em",
                                borderRadius: "4px",
                                fontSize: "0.95em",
                                overflowX: "auto",
                                maxHeight: 300,
                                minHeight: 100,
                            }}
                        >
                            {logsOutput || _("No logs to display.")}
                        </pre>

                </CardExpandableContent>
            </Card>

            <Card isExpanded={isAdvancedDetailsExpanded}>
                <CardHeader
                    className="ct-card-expandable-header"
                    onExpand={() => setIsAdvancedDetailsExpanded(!isAdvancedDetailsExpanded)} 
                    toggleButtonProps={{
                        id: 'expandable-card-toggle',
                        'aria-label': isAdvancedDetailsExpanded ? _('Collapse details') : _('Expand details'),
                    }}
                    isToggleRightAligned={isCardToggleRightAligned}
                >
                    <CardTitle>{_("Advanced Details")}</CardTitle>
                </CardHeader>
                <CardExpandableContent>
                        <div>
                            <strong>{_("Raw Configuration File Contents")}:</strong>
                            <pre
                                style={{
                                    background: "#222",
                                    color: "#eee",
                                    padding: "1em",
                                    borderRadius: "4px",
                                    fontSize: "0.95em",
                                    overflowX: "auto",
                                    maxHeight: 300,
                                    minHeight: 100,
                                }}
                            >
                                {configFileContents}
                            </pre>
                        </div>
                </CardExpandableContent>
            </Card>

        </>
    );
};
