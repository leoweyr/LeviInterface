# LeviInterface

A logic tree development framework that supports cross-plugin UI queues at runtime in Minecraft Legacy Script Engine.

## 🏗️ Development Framework

Add the API package to your project dependencies:

```bash
npm install @levimc-lse/interface-api
```

Plugins developed with the API package <font color="red">must add the master plugin as a dependency to their `manifest.json`:</font>

```json
{
    "dependencies": [
        {
          "name": "LeviInterfaceMaster"
        }
    ]
}
```

## 🔌 Master Plugin

Install using lip in the LeviLamina server working directory:

```bash
lip install github.com/leoweyr/LeviInterface
```
