# RMD Params Injector

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://open-vsx.org/extension/kevinaslesen/rmd-params-injector)

Automatically injects R Markdown / Quarto `params` into your R session 
when working interactively in Positron or VS Code.

## Why?

When working interactively with `.Rmd` or `.qmd` files, `params` only 
exist at knit/render time — not in your interactive R session. This 
extension fixes that by automatically injecting `params` as an R list 
whenever you switch to a parameterized file.

## Features

- 🔄 Auto-injects params when switching to an `.Rmd` / `.qmd` tab
- 💾 Re-injects when you save the file (picks up YAML changes)
- 🔀 Automatically swaps params when switching between files
- ✅ Prevents params from being mixed between different scripts
- 🖥️ Works with Positron and VS Code

## Usage

1. Open any `.Rmd` or `.qmd` file with a `params:` block:

    ```yaml
    ---
    title: "Sales Report"
    params:
      region: "North"
      threshold: 100
      debug_mode: false
    ---
    ```

2. Params are automatically injected into your R console:

    ```r
    params = list(region = "North", threshold = 100, debug_mode = FALSE)
    ```

3. Use `params$region`, `params$threshold` etc. interactively!

## Supported Param Types

| YAML Type | R Output |
|---|---|
| `"string"` | `"string"` |
| `123` | `123` |
| `true` / `false` | `TRUE` / `FALSE` |
| `[a, b, c]` | `c("a", "b", "c")` |
| `NULL` | `NULL` |

## Settings

| Setting | Default | Description |
|---|---|---|
| `rmdParams.autoInjectOnSave` | `true` | Re-inject params on file save |

## Manual Inject

Press `Ctrl+Shift+P` → **"RMD: Inject Params into R Session"**

## Requirements

- Positron **or** VS Code with the R extension
- An active R session

## License

MIT