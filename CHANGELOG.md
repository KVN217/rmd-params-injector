# Changelog

All notable changes to **RMD Params Injector** will be documented here.

## [1.1.1] - 2026-04-08
### Changed
- Create fallback to use executeCode if older Positron version is used

---
## [1.1.0] - 2026-04-08
### Changed
- Use evaluateCode instead of executeCode to update params (requires Positron 2026.04.0+)

---

## [1.0.4] - 2026-03-20
### Fixed
- Fixed engine version mismatch for Positron compatibility

### Added
- Start recording changes in CHANGELOG

---

## [1.0.3] - 2026-03-20
### Changed
- Positron runtime API support

---

## [1.0.2] - 2026-03-19
### Changed
- Updated README

---

## [1.0.1] - 2026-03-19
### Changed
- Updated version number

---

## [1.0.0] - 2026-03-19
### Added
- Initial release
- YAML front matter parsing for `.Rmd` and `.qmd` files
- Param injection into R session
- Auto-inject params on tab switch
- Auto-inject params on save