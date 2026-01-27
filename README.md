# jupyterlab_camunda_modeller_extension

[![GitHub Actions](https://github.com/stellarshenson/jupyterlab_camunda_modeller_extension/actions/workflows/build.yml/badge.svg)](https://github.com/stellarshenson/jupyterlab_camunda_modeller_extension/actions/workflows/build.yml)
[![npm version](https://img.shields.io/npm/v/jupyterlab_camunda_modeller_extension.svg)](https://www.npmjs.com/package/jupyterlab_camunda_modeller_extension)
[![PyPI version](https://img.shields.io/pypi/v/jupyterlab-camunda-modeller-extension.svg)](https://pypi.org/project/jupyterlab-camunda-modeller-extension/)
[![Total PyPI downloads](https://static.pepy.tech/badge/jupyterlab-camunda-modeller-extension)](https://pepy.tech/project/jupyterlab-camunda-modeller-extension)
[![JupyterLab 4](https://img.shields.io/badge/JupyterLab-4-orange.svg)](https://jupyterlab.readthedocs.io/en/stable/)
[![Brought To You By KOLOMOLO](https://img.shields.io/badge/Brought%20To%20You%20By-KOLOMOLO-00ffff?style=flat)](https://kolomolo.com)
[![Donate PayPal](https://img.shields.io/badge/Donate-PayPal-blue?style=flat)](https://www.paypal.com/donate/?hosted_button_id=B4KPBJDLLXTSA)

Model BPMN diagrams and open Camunda BPMN files directly in JupyterLab. This extension provides a visual editor for business process modelling within the JupyterLab environment.

![Screenshot](.resources/screenshot.png)

## Features

- **BPMN diagram modelling** - Create and edit BPMN 2.0 diagrams visually
- **Camunda BPMN support** - Open and modify Camunda-specific BPMN files
- **JupyterLab integration** - Native file browser integration for .bpmn files
- **Server-side processing** - Backend support for diagram operations

## Requirements

- JupyterLab >= 4.0.0

## Installation

```bash
pip install jupyterlab-camunda-modeller-extension
```

## Development

> [!IMPORTANT]
> Always use `make install` for development installation. Do not run raw `pip install` or `npm install` commands.

```bash
# Install for development
make install

# Run tests
make test

# Build production package
make build
```

## Uninstall

```bash
pip uninstall jupyterlab_camunda_modeller_extension
```
