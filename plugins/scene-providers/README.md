# Scene Providers

A scene provider contributes SceneSpec records only.

It must not:
- alter Core grammar,
- add transport logic,
- call image providers,
- mutate other plugins.

Preferred format: JSON catalog fragment.
