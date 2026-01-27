<!-- @import /home/lab/workspace/.claude/CLAUDE.md -->

# Project-Specific Configuration

This file imports workspace-level configuration from `/home/lab/workspace/.claude/CLAUDE.md`.
All workspace rules apply. Project-specific rules below strengthen or extend them.

The workspace `/home/lab/workspace/.claude/` directory contains additional instruction files
(MERMAID.md, NOTEBOOK.md, DATASCIENCE.md, GIT.md, JUPYTERLAB_EXTENSION.md, and others) referenced by CLAUDE.md.
Consult workspace CLAUDE.md and the .claude directory to discover all applicable standards.

## Mandatory Bans (Reinforced)

The following workspace rules are STRICTLY ENFORCED for this project:

- **No automatic git tags** - only create tags when user explicitly requests
- **No automatic version changes** - only modify version in package.json/pyproject.toml when user explicitly requests
- **No automatic publishing** - never run `make publish`, `npm publish`, `twine upload` without explicit user request
- **No manual package installs** - use `make install` or equivalent Makefile targets, not direct `pip install`/`npm install`/`jlpm install`
- **No automatic git commits or pushes** - only when user explicitly requests
- **Always include package.json and package-lock.json** - these files must be tracked in git

## Project Context

JupyterLab extension for modelling BPMN diagrams and opening Camunda BPMN diagrams directly in JupyterLab.

**Technology Stack**:

- JupyterLab 4.x frontend extension (TypeScript)
- Jupyter Server extension (Python)
- BPMN/Camunda diagram support

**Package Names**:

- npm: `jupyterlab_camunda_modeller_extension`
- PyPI: `jupyterlab-camunda-modeller-extension` (hyphenated)

**Build System**:

- Makefile orchestrates all build operations
- Use `make install` for development installation
- Use `make build` for production builds
- Use `make test` for running tests

## Strengthened Rules

- Always follow `JUPYTERLAB_EXTENSION.md` for extension development patterns
- Use Makefile targets exclusively - never run raw npm/pip/jlpm commands for installation
