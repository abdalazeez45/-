import 'zone.js';
import 'zone.js/testing';

import { TestBed } from '@angular/core/testing';
import {
    BrowserTestingModule,
    platformBrowserTesting
} from '@angular/platform-browser/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import { COMPILER_OPTIONS, NgModule, provideZoneChangeDetection, VERSION } from '@angular/core';

// Mock HTML files
const mockHtml = '<div></div>';
Object.defineProperty(window, 'require', {
    writable: true,
    value: (id: string) => {
        if (id.endsWith('.html')) {
            return mockHtml;
        }
        return {};
    }
});

// Mock CSS/SCSS files
Object.defineProperty(window, 'require', {
    writable: true,
    value: (id: string) => {
        if (id.endsWith('.css') || id.endsWith('.scss')) {
            return '';
        }
        if (id.endsWith('.html')) {
            return mockHtml;
        }
        return {};
    }
});

try {
    TestBed.resetTestEnvironment();
} catch (e) {}

if (+VERSION.major >= 21) {
    @NgModule({
        providers: [provideZoneChangeDetection()],
    })
    class TestModule { }

    TestBed.initTestEnvironment(
        [BrowserTestingModule, TestModule],
        platformBrowserTesting([
            {
                provide: COMPILER_OPTIONS,
                useValue: {},
                multi: true,
            },
        ]),
    );
} else {
    TestBed.initTestEnvironment(
        [BrowserDynamicTestingModule],
        platformBrowserDynamicTesting(),
    );
}
