# Nuttin2c Core

Framework core for building modular single-page apps with dependency injection, component composition, and URL-driven navigation.

## Capabilities

- **Application runner** with module loading and worker startup (`Application`).
- **Module system** with DI integration and async loading (`Module`, `ModuleLoader`, `DiModuleLoader`).
- **Trail-based navigation** for UI and browser history sync (`TrailProcessor`, `History`).
- **Component system** with template- and inline-driven rendering (`TemplateComponentFactory`, `InlineComponentFactory`).
- **Template & styles registries** with async loading and caching (`TemplateRegistry`, `StylesRegistry`).
- **Canvas root** utilities for mounting UI into the DOM (`CanvasRoot`).
- **State management** with reactive listeners and async handling (`StateManager`).
- **Event utilities** for structured event dispatching (`EventManager`).
- **Data binding** helpers for input elements (`InputElementDataBinding`, `ProxyObjectFactory`).
- **Validators** for common input constraints.

## Install & build

```bash
npm install
npm run build
```

Build outputs:
- `dist/jsm/nuttin2c-core_v1.js`
- `dist/jsm/nuttin2c-core_v1.min.js`
- `dist/cjs/nuttin2c-core_v1.js`

## Short code examples

### 1) Minimal module + app bootstrap

```html
<html>
  <head>
    
  </head>
  <body id="body">

  <body>
  <script type="module" charset="utf-8" src="/moduleLoader.js"></script>
</html>
```

```js
import { Application } from "nuttin2c-core_v1.js";
import { DiModuleLoader } from "nuttin2c-core_v1.js";
import { Module } from "nuttin2c-core_v1.js";
import { CanvasRoot } from "nuttin2c-core_v1.js";
import { ComponentBuilder } from "nuttin2c-core_v1.js";
import { UniqueIdRegistry } from "nuttin2c-core_v1.js";

class HelloModule extends Module {
  async load() {
    const builder = ComponentBuilder.create(UniqueIdRegistry.instance());
    const component = builder
      .root("div")
      .open()
        .node("h1")
        .text("Nuttin2c here, move along")
      .close()
      .build();

    CanvasRoot.setComponent("body", component);
    return this;
  }
}
```

```js
import { MindiConfig, SingletonConfig } from "mindi_v1";
import { UniqueIdRegistry } from "nuttin2c-core_v1.js";

const config = new MindiConfig().addAllTypeConfig([
  SingletonConfig.unnamed(UniqueIdRegistry)
]);
await config.finalize();

const loaders = [
  new DiModuleLoader("/module/helloModule.js", "/", config)
];

new Application(loaders, config).run();
```

### 2) Trail navigation

```js
import { TrailProcessor } from "nuttin2c-core_v1";

const TRAIL_MAP = {
  trail: "/settings",
  property: "settingsController",
  destination: SettingsController.prototype.reset,
  waypoint: null,
  next: [
    {
      trail: "/profile",
      destination: SettingsController.prototype.showProfile,
      waypoint: SettingsController.prototype.showProfile
    }
  ]
};

// Push /settings/profile to history and call waypoints
TrailProcessor.uiNavigate(
  SettingsController.prototype.showProfile,
  settingsModule,
  TRAIL_MAP
);
```

### 3) State manager with async data

```js
import { StateManager } from "nuttin2c-core_v1";

const state = new StateManager();

state.react((value) => {
  console.log("Domain updated:", value);
}, (error) => {
  console.error("Error:", error);
});

state.handle(fetch("/api/items").then(r => r.json()));
```

### 4) Input data binding

```js
import { InputElementDataBinding } from "nuttin2c-core_v1";
import { ProxyObjectFactory } from "nuttin2c-core_v1";
import { HTML } from "nuttin2c-core_v1";

const model = ProxyObjectFactory.createProxyObject({ name: "" });
const input = HTML.custom("input");
input.setAttributeValue("name", "name");

InputElementDataBinding.link(model).to(input);
```

## Notes

- This package depends on `mindi_v1`, `coreutil_v1`, `containerbridge_v1`, and `xmlparser_v1`.
- Use the ESM build for browser apps, or CJS for Node environments.
