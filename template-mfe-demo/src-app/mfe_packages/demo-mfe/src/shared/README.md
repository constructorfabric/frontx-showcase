# Shared Utilities

This directory contains shared utilities and hooks used across multiple screens in the demo MFE:

- **i18n helpers**: Hooks and utilities for MFE-local internationalization
- **common hooks**: Custom React hooks shared across screens
- **kit theme scope**: the lifecycle base that anchors the kit's tokens in each shadow root, and the theme-to-scope mapping (the screens' styles live in `../blocks/`)

These utilities are internal to the demo-mfe package and enable code reuse between the 4 screen entries.
