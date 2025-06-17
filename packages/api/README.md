# LeviInterface API

API for the logic tree development framework that supports cross-plugin UI queues at runtime in Minecraft Legacy Script Engine.

## ❗ Important

All Legacy Script Engine plugins developed using this package <font color="red">must add LeviInterface master plugin as a dependency to their `manifest.json`:</font>

```json
{
    "dependencies": [
        {
          "name": "LeviInterfaceMaster"
        }
	]
}
```

Install the LeviInterface master plugin via lip in the LeviLamina server working directory:

```bash
lip install github.com/leoweyr/LeviInterface
```
