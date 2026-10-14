---
name: jupyterlab-camunda-modeller-extension
description: BPMN 2.0 / Camunda 7 process design, colouring and validation, through the `bpmn-validate` CLI of jupyterlab_camunda_modeller_extension - malformed XML, broken references, elements the modeller cannot show, unreachable steps, unnamed gateway conditions. Use when designing or drawing a business process, when writing, editing, colouring or reviewing a .bpmn file, when a .bpmn file will not open in JupyterLab or Camunda Modeler, or on "model this process", "create a BPMN diagram", "validate this BPMN" or "check the diagram".
---

# bpmn-validate

Local CLI, reads .bpmn files, never changes them. Checks, output format, exit codes: `bpmn-validate --help`. Read first. Many files: `--json`, keep `code`, `line`, `element`, `message`.

## Validate

- Mandatory: after every create or edit you make to a .bpmn file, run `bpmn-validate` on it before replying to the user. Exit 1 means errors: fix every one, rerun. Not done until exit 0
- `malformed-xml`, `doctype`, `not-bpmn` stop all other checks. Fix first, rerun for the rest
- Warnings do not fail the run. Fix warnings your own edit caused; report the others and fix those only on request. New-diagram template warns `no-end-event` and `disconnected` by design
- `missing-shape`: element invisible in modeller. Add `bpmndi:BPMNShape` with `dc:Bounds`, or `bpmndi:BPMNEdge` with two or more `di:waypoint`, inside the `BPMNPlane`. Never delete the element to silence it
- `missing-reference` on `incoming`/`outgoing`: make them match the `sourceRef`/`targetRef` of the sequence flows
- Camunda 8 / Zeebe attributes not checked; modeller supports Camunda 7 only

## Model

- Before modelling a start event, task types or decisions, ask user one short round: what starts the process (manual = plain `bpmn:startEvent`; message, timer, signal, condition = start event with that event definition), who or what does each step (person, system, undecided), the condition at each decision. Only questions the design needs
- Task type: plain `bpmn:task` while undecided whether a person or a system does it; `bpmn:serviceTask` when likely automatic
- Deciding gateway (exclusive, inclusive): name every outgoing flow with its condition, set one flow as the gateway `default`. Checks `unnamed-condition`, `no-default-flow`
- Process annotation: one text annotation above the pools, with a `bpmn:association` to the pool it describes. Very brief, plain English, short words, for readers who are not native speakers
- Red only on error or problem shapes and on negative decision outcomes. Red text annotation only where the note points the analyst at a problem to solve
- Colour: picker palette only, lowercase hex, fill/stroke: Blue `#bbdefb`/`#0d4372`, Orange `#ffe0b2`/`#6b3c00`, Green `#c8e6c9`/`#205022`, Red `#ffcdd2`/`#831311`, Purple `#e1bee7`/`#5b176d`
- Shape colour: on its `bpmndi:BPMNShape` set `bioc:fill` and `color:background-color` to fill, `bioc:stroke` and `color:border-color` to stroke. Edge: stroke pair only. No attributes = default colour. Namespaces on `bpmn:definitions`: `xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"`, `xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0"`

<!-- improved 2026-10-14 | body 405→431w / 27→28L | benchmark n/a (not-requested) | via improve-skill -->
