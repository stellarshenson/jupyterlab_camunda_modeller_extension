import json
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

import pytest

from jupyterlab_camunda_modeller_extension.cli import main
from jupyterlab_camunda_modeller_extension.validate import CHECKS, validate

ROOT = Path(__file__).resolve().parents[2]
SKILL = ".agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md"

NS = (
    'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" '
    'xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" '
    'xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" '
    'xmlns:di="http://www.omg.org/spec/DD/20100524/DI"'
)


def bpmn(process, shapes):
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions {NS} id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
{process}
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
{shapes}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
"""


def shape(element_id):
    return (
        f'      <bpmndi:BPMNShape id="{element_id}_di" bpmnElement="{element_id}">'
        '<dc:Bounds x="0" y="0" width="36" height="36"/></bpmndi:BPMNShape>'
    )


def edge(element_id):
    return (
        f'      <bpmndi:BPMNEdge id="{element_id}_di" bpmnElement="{element_id}">'
        '<di:waypoint x="0" y="0"/><di:waypoint x="10" y="0"/></bpmndi:BPMNEdge>'
    )


CONNECTED = bpmn(
    """    <bpmn:startEvent id="Start_1"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:task id="Task_1"><bpmn:incoming>Flow_1</bpmn:incoming><bpmn:outgoing>Flow_2</bpmn:outgoing></bpmn:task>
    <bpmn:endEvent id="End_1"><bpmn:incoming>Flow_2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_1" targetRef="Task_1"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="End_1"/>""",
    "\n".join(
        [shape("Start_1"), shape("Task_1"), shape("End_1"), edge("Flow_1"), edge("Flow_2")]
    ),
)

# The empty-diagram template of src/widget.ts (EMPTY_BPMN)
TEMPLATE = bpmn(
    '    <bpmn:startEvent id="StartEvent_1"/>', shape("StartEvent_1")
)


def codes(text):
    return sorted(issue.code for issue in validate(text))


# ACC-VALID-62
def test_connected_diagram_reports_nothing():
    assert validate(CONNECTED) == []


def test_repository_sample_written_by_the_modeller_reports_nothing():
    assert validate((ROOT / ".resources/diagram.bpmn").read_bytes()) == []


COLLABORATION = f"""<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions {NS} id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Pool_A" processRef="Process_A"/>
    <bpmn:participant id="Pool_B"/>
    <bpmn:messageFlow id="Message_1" sourceRef="Task_A" targetRef="Pool_B"/>
    <bpmn:textAnnotation id="ProcNote"><bpmn:text>Orders are checked, then approved or rejected.</bpmn:text></bpmn:textAnnotation>
    <bpmn:association id="ProcAssoc" sourceRef="Pool_A" targetRef="ProcNote"/>
  </bpmn:collaboration>
  <bpmn:message id="Msg_1" name="order"/>
  <bpmn:process id="Process_A" isExecutable="true">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_1"><bpmn:flowNodeRef>Start_A</bpmn:flowNodeRef></bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="Start_A"><bpmn:messageEventDefinition id="MED_1" messageRef="Msg_1"/></bpmn:startEvent>
    <bpmn:task id="Task_A"/>
    <bpmn:subProcess id="Sub_A"><bpmn:task id="Inner_A"/></bpmn:subProcess>
    <bpmn:exclusiveGateway id="Gate_A" default="Flow_3"/>
    <bpmn:endEvent id="End_A"/>
    <bpmn:endEvent id="End_B"/>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_A" targetRef="Task_A"/>
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_A" targetRef="Sub_A"/>
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Sub_A" targetRef="Gate_A"/>
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Gate_A" targetRef="End_A"/>
    <bpmn:sequenceFlow id="Flow_4" name="rejected" sourceRef="Gate_A" targetRef="End_B"/>
    <bpmn:textAnnotation id="Note_1"><bpmn:text>note</bpmn:text></bpmn:textAnnotation>
    <bpmn:association id="Assoc_1" sourceRef="Task_A" targetRef="Note_1"/>
    <bpmn:task id="Undo_A" isForCompensation="true"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
{chr(10).join(shape(i) for i in ["Pool_A", "Pool_B", "Lane_1", "Start_A", "Task_A", "Sub_A", "Gate_A", "End_A", "End_B", "Note_1", "Undo_A", "ProcNote"])}
{chr(10).join(edge(i) for i in ["Message_1", "Flow_1", "Flow_2", "Flow_3", "Flow_4", "Flow_5", "Assoc_1", "ProcAssoc"])}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
  <bpmndi:BPMNDiagram id="BPMNDiagram_2">
    <bpmndi:BPMNPlane id="BPMNPlane_2" bpmnElement="Sub_A">
{shape("Inner_A")}
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>
"""


def test_collaboration_with_lanes_process_annotation_and_collapsed_subprocess():
    # Inner_A sits alone in the collapsed subprocess, so it is disconnected
    issues = validate(COLLABORATION)
    assert [(i.code, "Inner_A" in i.message) for i in issues] == [("disconnected", True)]


def test_template_reports_only_its_modelling_warnings():
    issues = validate(TEMPLATE)
    assert sorted(i.code for i in issues) == ["disconnected", "no-end-event"]
    assert all(i.severity == "warning" for i in issues)


# ACC-VALID-49
def test_malformed_xml_reports_parser_position_and_stops():
    text = CONNECTED.replace("<bpmn:task id=\"Task_1\">", "<bpmn:task id=\"Task_1\">\n<broken>")
    issues = validate(text)
    assert [i.code for i in issues] == ["malformed-xml"]
    assert issues[0].severity == "error"
    assert issues[0].line > 1 and issues[0].column >= 1
    assert "mismatched tag" in issues[0].message


# ACC-VALID-50
@pytest.mark.parametrize("text", ["", "  \n\t\n"])
def test_empty_file_is_a_warning(text):
    issues = validate(text)
    assert [(i.severity, i.code) for i in issues] == [("warning", "empty-file")]


# ACC-VALID-51
def test_doctype_rejected_before_entity_expansion():
    entities = '<!ENTITY e0 "lol">' + "".join(
        f'<!ENTITY e{n} "{f"&e{n - 1};" * 10}">' for n in range(1, 10)
    )
    text = f'<?xml version="1.0"?><!DOCTYPE d [{entities}]><bpmn:definitions {NS}>&e9;</bpmn:definitions>'
    start = time.monotonic()
    issues = validate(text)
    assert time.monotonic() - start < 1
    assert [(i.severity, i.code) for i in issues] == [("error", "doctype")]


# ACC-VALID-52
@pytest.mark.parametrize(
    "text",
    [
        '<svg xmlns="http://www.w3.org/2000/svg"/>',
        '<definitions xmlns="http://example.com/other" id="D"/>',
    ],
)
def test_not_bpmn_root_is_an_error_and_stops(text):
    issues = validate(text)
    assert [(i.severity, i.code) for i in issues] == [("error", "not-bpmn")]


# ACC-VALID-53
def test_duplicate_id_names_the_first_line():
    text = CONNECTED.replace('<bpmn:endEvent id="End_1">', '<bpmn:endEvent id="Task_1">')
    issues = [i for i in validate(text) if i.code == "duplicate-id"]
    assert len(issues) == 1
    first_line = text.splitlines().index(
        next(l for l in text.splitlines() if '<bpmn:task id="Task_1">' in l)
    ) + 1
    assert f"line {first_line}" in issues[0].message
    assert issues[0].line > first_line


# ACC-VALID-54
def test_missing_target_ref_is_an_error():
    text = CONNECTED.replace('targetRef="End_1"', 'targetRef="End_9"')
    issues = [i for i in validate(text) if i.code == "missing-reference"]
    assert len(issues) == 1 and issues[0].severity == "error"
    assert "targetRef" in issues[0].message and "End_9" in issues[0].message


def test_missing_bpmn_element_and_outgoing_text_are_errors():
    text = CONNECTED.replace(
        "<bpmn:outgoing>Flow_1</bpmn:outgoing>", "<bpmn:outgoing>Flow_7</bpmn:outgoing>"
    ).replace('bpmnElement="Task_1"', 'bpmnElement="Task_7"')
    messages = [i.message for i in validate(text) if i.code == "missing-reference"]
    assert any("Flow_7" in m for m in messages)
    assert any("Task_7" in m for m in messages)


# ACC-VALID-55
def test_no_diagram_is_an_error():
    text = CONNECTED.split("  <bpmndi:BPMNDiagram")[0] + "</bpmn:definitions>\n"
    issues = validate(text)
    assert ("error", "no-diagram") in [(i.severity, i.code) for i in issues]
    assert "missing-shape" not in [i.code for i in issues]


# ACC-VALID-56
def test_element_without_shape_is_a_warning():
    text = CONNECTED.replace(shape("Task_1"), "")
    issues = [i for i in validate(text) if i.code == "missing-shape"]
    assert len(issues) == 1 and issues[0].severity == "warning"
    assert "Task_1" in issues[0].message


# ACC-VALID-57, ACC-VALID-58
def test_process_without_start_or_end_event():
    text = bpmn('    <bpmn:task id="Task_1"/>', shape("Task_1"))
    assert codes(text) == ["disconnected", "no-end-event", "no-start-event"]


# ACC-VALID-59
def test_start_event_with_incoming_flow():
    text = CONNECTED.replace('targetRef="End_1"', 'targetRef="Start_1"')
    assert "start-event-incoming" in codes(text)


# ACC-VALID-60
def test_end_event_with_outgoing_flow():
    text = CONNECTED.replace('sourceRef="Start_1"', 'sourceRef="End_1"')
    assert "end-event-outgoing" in codes(text)


# ACC-VALID-61
def test_disconnected_node_but_not_boundary_event():
    text = CONNECTED.replace(
        '<bpmn:sequenceFlow id="Flow_1"',
        '<bpmn:task id="Lonely_1"/><bpmn:boundaryEvent id="Boundary_1" attachedToRef="Task_1"/>'
        '<bpmn:sequenceFlow id="Flow_1"',
    ).replace(shape("End_1"), shape("End_1") + shape("Lonely_1") + shape("Boundary_1"))
    issues = [i for i in validate(text) if i.code == "disconnected"]
    assert len(issues) == 1 and "Lonely_1" in issues[0].message


@pytest.fixture
def files(tmp_path):
    clean = tmp_path / "clean.bpmn"
    clean.write_text(CONNECTED)
    broken = tmp_path / "broken.bpmn"
    broken.write_text(CONNECTED.replace('targetRef="End_1"', 'targetRef="End_9"'))
    return clean, broken


# ACC-VALID-46
def test_exit_codes(files, tmp_path, capsys):
    clean, broken = files
    template = tmp_path / "template.bpmn"
    template.write_text(TEMPLATE)
    assert main([str(clean)]) == 0
    assert main([str(template)]) == 0
    assert main([str(clean), str(broken)]) == 1
    assert main([str(broken), str(tmp_path / "missing.bpmn")]) == 2
    assert "missing.bpmn" in capsys.readouterr().err
    with pytest.raises(SystemExit) as exc:
        main([])
    assert exc.value.code == 2


# ACC-VALID-47
def test_text_output_format(files, capsys):
    _, broken = files
    main([str(broken)])
    lines = capsys.readouterr().out.splitlines()
    line = next(l for l in broken.read_text().splitlines() if 'targetRef="End_9"' in l)
    number = broken.read_text().splitlines().index(line) + 1
    assert lines[0].startswith(f"{broken}:{number}:")
    assert ": error missing-reference: " in lines[0]
    # End_1 loses its only incoming flow, so it is also disconnected
    assert lines[-1] == f"{broken}: 1 error, 1 warning"


# ACC-VALID-48
def test_json_output_matches_text(files, capsys):
    clean, broken = files
    main(["--json", str(clean), str(broken)])
    report = json.loads(capsys.readouterr().out)
    assert [f["path"] for f in report["files"]] == [str(clean), str(broken)]
    assert report["files"][0]["issues"] == []
    issue = report["files"][1]["issues"][0]
    assert set(issue) == {"severity", "code", "message", "line", "column", "element"}
    assert issue["code"] == "missing-reference"
    assert report["files"][1]["errors"] == 1


# ACC-VALID-45
def test_help_names_every_check_and_exit_code(monkeypatch, capsys):
    monkeypatch.setenv("PYTHON_COLORS", "0")
    with pytest.raises(SystemExit) as exc:
        main(["--help"])
    assert exc.value.code == 0
    out = capsys.readouterr().out
    for code in CHECKS:
        assert code in out
    for status in ("0 ", "1 ", "2 "):
        assert f"\n  {status}" in out
    assert "examples:" in out


# ACC-VALID-44
def test_installed_command_runs():
    command = shutil.which("bpmn-validate")
    assert command, "bpmn-validate is not on PATH - run make install"
    result = subprocess.run([command, "--help"], capture_output=True, text=True)
    assert result.returncode == 0


# ACC-VALID-63
def test_installed_skill_matches_repository_copy():
    installed = Path(sys.prefix) / "share/jupyter/agents/skills/jupyterlab-camunda-modeller-extension/SKILL.md"
    assert installed.read_text() == (ROOT / SKILL).read_text()


# ACC-VALID-66
def test_skill_lists_the_colour_picker_palette():
    picker = ROOT / "node_modules/bpmn-js-color-picker/colors/ColorPopupProvider.js"
    if not picker.exists():
        pytest.skip("node_modules not installed")
    colours = re.findall(
        r"label: '(\w+)',\s*fill: '(#\w+)',\s*stroke: '(#\w+)'", picker.read_text()
    )
    assert len(colours) == 5
    skill = (ROOT / SKILL).read_text()
    for label, fill, stroke in colours:
        assert f"{label} `{fill.lower()}`/`{stroke.lower()}`" in skill
    for attribute in ("bioc:fill", "color:background-color", "bioc:stroke", "color:border-color"):
        assert attribute in skill


def gateway(default='default="Flow_Yes"', yes='name="approved"', no='name="rejected"'):
    return bpmn(
        f"""    <bpmn:startEvent id="Start_1"/>
    <bpmn:exclusiveGateway id="Gate_1" {default}/>
    <bpmn:endEvent id="End_Yes"/>
    <bpmn:endEvent id="End_No"/>
    <bpmn:sequenceFlow id="Flow_In" sourceRef="Start_1" targetRef="Gate_1"/>
    <bpmn:sequenceFlow id="Flow_Yes" {yes} sourceRef="Gate_1" targetRef="End_Yes"/>
    <bpmn:sequenceFlow id="Flow_No" {no} sourceRef="Gate_1" targetRef="End_No"/>""",
        "\n".join(
            [shape(i) for i in ["Start_1", "Gate_1", "End_Yes", "End_No"]]
            + [edge(i) for i in ["Flow_In", "Flow_Yes", "Flow_No"]]
        ),
    )


def test_gateway_with_named_flows_and_default_reports_nothing():
    assert validate(gateway()) == []


# ACC-VALID-70
def test_unnamed_condition_on_a_non_default_flow():
    issues = [i for i in validate(gateway(no="")) if i.code == "unnamed-condition"]
    assert len(issues) == 1 and issues[0].severity == "warning"
    assert "Flow_No" in issues[0].message


def test_unnamed_default_flow_is_not_reported():
    assert "unnamed-condition" not in codes(gateway(yes=""))


# ACC-VALID-71
def test_gateway_without_default_flow():
    issues = [i for i in validate(gateway(default="")) if i.code == "no-default-flow"]
    assert len(issues) == 1 and issues[0].severity == "warning"
    assert "Gate_1" in issues[0].message


def test_parallel_gateway_needs_no_conditions_or_default():
    text = gateway(default="", yes="", no="").replace("exclusiveGateway", "parallelGateway")
    assert validate(text) == []


def flows_between(*pairs):
    return "\n".join(
        f'    <bpmn:sequenceFlow id="F_{s}_{t}" sourceRef="{s}" targetRef="{t}"/>'
        for s, t in pairs
    )


def process_with(nodes, pairs, extra=""):
    ids = [n.split('id="')[1].split('"')[0] for n in nodes]
    return bpmn(
        "\n".join(f"    {n}" for n in nodes) + "\n" + extra + flows_between(*pairs),
        "\n".join([shape(i) for i in ids] + [edge(f"F_{s}_{t}") for s, t in pairs]),
    )


# ACC-VALID-74
def test_unreachable_chain_and_loop():
    text = process_with(
        [
            '<bpmn:startEvent id="S"/>', '<bpmn:endEvent id="E"/>',
            '<bpmn:task id="A"/>', '<bpmn:task id="B"/>',
            '<bpmn:task id="X"/>', '<bpmn:task id="Y"/>',
        ],
        [("S", "E"), ("A", "B"), ("X", "Y"), ("Y", "X")],
    )
    issues = [i for i in validate(text) if i.code == "unreachable"]
    assert sorted(i.message.split("'")[1] for i in issues) == ["A", "B", "X", "Y"]
    assert all(i.severity == "warning" for i in issues)


def test_path_through_boundary_event_is_reachable():
    text = process_with(
        [
            '<bpmn:startEvent id="S"/>', '<bpmn:task id="T"/>', '<bpmn:endEvent id="E"/>',
            '<bpmn:boundaryEvent id="Timer" attachedToRef="T"/>',
            '<bpmn:task id="Escalate"/>', '<bpmn:endEvent id="E2"/>',
        ],
        [("S", "T"), ("T", "E"), ("Timer", "Escalate"), ("Escalate", "E2")],
    )
    assert "unreachable" not in codes(text)


def test_scope_without_start_event_starts_from_nodes_without_incoming_flow():
    text = process_with(
        ['<bpmn:task id="A"/>', '<bpmn:task id="B"/>', '<bpmn:endEvent id="E"/>'],
        [("A", "B"), ("B", "E")],
    )
    assert "unreachable" not in codes(text)


# ACC-VALID-79
def test_issue_names_its_element():
    text = CONNECTED.replace('targetRef="End_1"', 'targetRef="End_9"')
    issue = next(i for i in validate(text) if i.code == "missing-reference")
    assert issue.element == "Flow_2"
    assert validate("<broken")[0].element == ""
