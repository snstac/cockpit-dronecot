import { compile } from 'sass';
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

import { DRONECOT_INSTANCES, instanceKeyFromPath } from './instances';

describe('Cockpit page layout', () => {
    test('provides a viewport-height root scroller', () => {
        const css = compile('src/app.scss', {
            loadPaths: ['pkg/lib', 'node_modules'],
            quietDeps: true,
        }).css;

        expect(css).toMatch(/html,\s*body,\s*#app\s*{[^}]*block-size:\s*100%/s);
        expect(css).toMatch(/#app\s*{[^}]*overflow-y:\s*auto/s);
    });
});

describe('explicit DroneCOT instances', () => {
    test('maps only fixed page names to services and defaults', () => {
        expect(instanceKeyFromPath('/cockpit/dronecot/dronescout.html')).toBe('dronescout');
        expect(instanceKeyFromPath('/cockpit/dronecot/wifi.html')).toBe('wifi');
        expect(instanceKeyFromPath('/cockpit/dronecot/../../etc/passwd')).toBe('dji');
        expect(Object.values(DRONECOT_INSTANCES).map(item => item.serviceName)).toEqual([
            'dronecot-dji',
            'dronecot-dronescout',
            'dronecot-wifi',
            'dronecot-ble',
        ]);
        for (const item of Object.values(DRONECOT_INSTANCES))
            expect(item.configFile).toBe(`/etc/default/${item.serviceName}`);
        for (const item of Object.values(DRONECOT_INSTANCES))
            expect(item.config).not.toHaveProperty('STATUS_APP');
        expect(DRONECOT_INSTANCES.dji.config.COT_URL.defaultValue).toBe('');
        expect(DRONECOT_INSTANCES.dji.config.COT_URL.required).toBe(false);
    });

    test('lists every instance in the manifest and authorization policy', () => {
        const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'));
        const policy = readFileSync(
            new URL('../packaging/49-cockpit-dronecot.rules', import.meta.url),
            'utf8',
        );

        expect(Object.keys(manifest.tools)).toEqual(['dji', 'dronescout', 'wifi', 'ble']);
        for (const item of Object.values(DRONECOT_INSTANCES)) {
            expect(policy).toContain(item.configFile);
            expect(manifest.tools[item.key].path).toBe(`${item.key}.html`);
        }
        expect(policy).not.toContain('path == "/etc/default/dronecot"');
    });
});
