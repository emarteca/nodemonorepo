# nested-workspace-helper

Some commands in needs for nodemonorepo

## Requirements

* Node.js ≥ 8.9.0

## CLIs

This program is divided into multiple subcommands which print usage messages when issued without arguments.

```sh
nested-workspace-helper # --> List global subcommands
nested-workspace-helper manifest # --> Manage `package.json` files
nested-workspace-helper version-management # --> Manage versions written in `package.json` files (alias: verman)
nested-workspace-helper dependency-management # --> Manage external dependency versions (alias: depman)
nested-workspace-helper validate # --> Find invalid packages
nested-workspace-helper publish # --> Publish are packages that satisfy certain conditions
```

Instead of writing long `nested-workspace-helper` command, you can use shorter `nested-wrkspc` alias.

## License

[MIT](https://git.io/vhaEz) © [Hoàng Văn Khải](https://github.com/KSXGitHub)
