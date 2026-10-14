"""Checks for BPMN 2.0 files: file and XML, references, modelling rules."""

from dataclasses import dataclass, field
from xml.parsers import expat

BPMN = "http://www.omg.org/spec/BPMN/20100524/MODEL"
BPMNDI = "http://www.omg.org/spec/BPMN/20100524/DI"

# Check code -> (severity, meaning); the CLI help is generated from this table
CHECKS = {
    "empty-file": ("warning", "file is empty; the modeller opens it as a new diagram"),
    "malformed-xml": ("error", "XML does not parse; no other check runs"),
    "doctype": ("error", "DOCTYPE present; parsing stops before any entity is expanded"),
    "not-bpmn": ("error", "root is not definitions in the BPMN 2.0 model namespace"),
    "duplicate-id": ("error", "two elements share an id"),
    "missing-reference": ("error", "a reference names an id that no element has"),
    "no-diagram": ("error", "no BPMNDiagram; the modeller cannot display the file"),
    "missing-shape": ("warning", "element has no shape or edge; the modeller does not show it"),
    "no-start-event": ("warning", "process has flow nodes but no start event"),
    "no-end-event": ("warning", "process has flow nodes but no end event"),
    "start-event-incoming": ("warning", "a sequence flow ends at a start event"),
    "end-event-outgoing": ("warning", "a sequence flow leaves an end event"),
    "disconnected": ("warning", "flow node has no incoming and no outgoing sequence flow"),
    "unnamed-condition": ("warning", "a flow leaving a deciding gateway has no name; name it with its condition"),
    "no-default-flow": ("warning", "a deciding gateway with two or more outgoing flows has no default flow"),
    "unreachable": ("warning", "no path of sequence flows from a start event reaches the flow node"),
}

# Attributes and child elements whose value is the id of another element
REF_ATTRIBUTES = (
    "sourceRef", "targetRef", "bpmnElement", "attachedToRef", "default", "processRef",
    "messageRef", "signalRef", "errorRef", "escalationRef", "dataObjectRef",
    "dataStoreRef", "categoryValueRef",
)
REF_ELEMENTS = ("incoming", "outgoing")

EVENTS = {
    "startEvent", "endEvent", "intermediateCatchEvent", "intermediateThrowEvent",
    "boundaryEvent",
}
ACTIVITIES = {
    "task", "userTask", "serviceTask", "scriptTask", "businessRuleTask", "sendTask",
    "receiveTask", "manualTask", "callActivity", "subProcess", "transaction",
    "adHocSubProcess",
}
# Elements whose direct flow nodes form one sequence-flow graph
SCOPES = {"process", "subProcess", "transaction"}
# Gateways whose outgoing flows carry conditions
DECIDING = {"exclusiveGateway", "inclusiveGateway"}
GATEWAYS = {
    "exclusiveGateway", "inclusiveGateway", "parallelGateway", "complexGateway",
    "eventBasedGateway",
}
FLOW_NODES = EVENTS | ACTIVITIES | GATEWAYS
# Elements bpmn-js draws only when a BPMNShape or BPMNEdge points at them
DRAWN = FLOW_NODES | {
    "sequenceFlow", "messageFlow", "association", "dataInputAssociation",
    "dataOutputAssociation", "textAnnotation", "dataObjectReference",
    "dataStoreReference", "participant", "lane", "group",
}


@dataclass
class Issue:
    severity: str
    code: str
    message: str
    line: int
    column: int
    element: str = ""


@dataclass
class _Element:
    ns: str
    name: str
    attrs: dict
    line: int
    column: int
    parent: "_Element | None"
    children: list = field(default_factory=list)
    text: str = ""

    def walk(self):
        yield self
        for child in self.children:
            yield from child.walk()


class _Doctype(Exception):
    pass


def _issue(code, message, line, column=1, element=""):
    return Issue(CHECKS[code][0], code, message, line, column, element or "")


def _parse(text):
    parser = expat.ParserCreate(namespace_separator=" ")
    stack = []
    root = []

    def start(tag, attrs):
        ns, _, name = tag.rpartition(" ")
        parent = stack[-1] if stack else None
        element = _Element(ns, name, attrs, parser.CurrentLineNumber,
                           parser.CurrentColumnNumber + 1, parent)
        if parent:
            parent.children.append(element)
        else:
            root.append(element)
        stack.append(element)

    def end(tag):
        stack.pop()

    def characters(data):
        if stack:
            stack[-1].text += data

    def doctype(*args):
        raise _Doctype(parser.CurrentLineNumber, parser.CurrentColumnNumber + 1)

    parser.StartElementHandler = start
    parser.EndElementHandler = end
    parser.CharacterDataHandler = characters
    parser.StartDoctypeDeclHandler = doctype
    parser.Parse(text, True)
    return root[0]


def _local_id(value):
    # A reference may carry a namespace prefix; an id itself never holds a colon
    return value.strip().rpartition(":")[2]


def validate(text):
    """Return the issues found in a BPMN file given as str or bytes."""
    if not text.strip():
        return [_issue("empty-file", "file is empty", 1)]
    try:
        root = _parse(text)
    except _Doctype as exc:
        line, column = exc.args
        return [_issue("doctype", "DOCTYPE declarations are not allowed in BPMN files",
                       line, column)]
    except expat.ExpatError as exc:
        return [_issue("malformed-xml", expat.ErrorString(exc.code), exc.lineno,
                       exc.offset + 1)]
    if root.ns != BPMN or root.name != "definitions":
        return [_issue("not-bpmn",
                       f"root element is {{{root.ns}}}{root.name}, expected definitions in {BPMN}",
                       root.line, root.column, root.attrs.get("id"))]

    issues = []
    elements = list(root.walk())
    ids = {}
    for element in elements:
        element_id = element.attrs.get("id")
        if element_id is None:
            continue
        if element_id in ids:
            issues.append(_issue("duplicate-id",
                                 f"id '{element_id}' already used at line {ids[element_id].line}",
                                 element.line, element.column, element.attrs.get("id")))
        else:
            ids[element_id] = element

    drawn = set()
    for element in elements:
        if element.ns not in (BPMN, BPMNDI):
            continue
        refs = [(name, element.attrs[name]) for name in REF_ATTRIBUTES if name in element.attrs]
        if element.ns == BPMN and element.name in REF_ELEMENTS:
            refs.append((element.name, element.text))
        # incoming/outgoing have no id; the issue names the flow node holding them
        owner = element.parent if element.name in REF_ELEMENTS else element
        for name, value in refs:
            target = _local_id(value)
            if target not in ids:
                issues.append(_issue("missing-reference",
                                     f"{name} '{target}' names no element",
                                     element.line, element.column, owner.attrs.get("id")))
            elif name == "bpmnElement":
                drawn.add(target)

    if not any(e.ns == BPMNDI and e.name == "BPMNDiagram" for e in elements):
        issues.append(_issue("no-diagram", "file has no BPMNDiagram", root.line, root.column, root.attrs.get("id")))
    else:
        for element in elements:
            element_id = element.attrs.get("id")
            if element.ns == BPMN and element.name in DRAWN and element_id not in drawn:
                issues.append(_issue("missing-shape",
                                     f"{element.name} '{element_id}' has no shape or edge",
                                     element.line, element.column, element.attrs.get("id")))

    issues.extend(_modelling(elements))
    return issues


def _modelling(elements):
    issues = []
    flows = [e for e in elements if e.ns == BPMN and e.name == "sequenceFlow"]
    sources = {_local_id(f.attrs.get("sourceRef", "")) for f in flows}
    targets = {_local_id(f.attrs.get("targetRef", "")) for f in flows}

    for process in (e for e in elements if e.ns == BPMN and e.name == "process"):
        nodes = [c for c in process.children if c.ns == BPMN and c.name in FLOW_NODES]
        if not nodes:
            continue
        process_id = process.attrs.get("id")
        if not any(n.name == "startEvent" for n in nodes):
            issues.append(_issue("no-start-event", f"process '{process_id}' has no start event",
                                 process.line, process.column, process.attrs.get("id")))
        if not any(n.name == "endEvent" for n in nodes):
            issues.append(_issue("no-end-event", f"process '{process_id}' has no end event",
                                 process.line, process.column, process.attrs.get("id")))

    for node in (e for e in elements if e.ns == BPMN and e.name in FLOW_NODES):
        node_id = node.attrs.get("id")
        if node.name == "startEvent" and node_id in targets:
            issues.append(_issue("start-event-incoming",
                                 f"start event '{node_id}' has an incoming sequence flow",
                                 node.line, node.column, node.attrs.get("id")))
        if node.name == "endEvent" and node_id in sources:
            issues.append(_issue("end-event-outgoing",
                                 f"end event '{node_id}' has an outgoing sequence flow",
                                 node.line, node.column, node.attrs.get("id")))
        if node_id not in sources and node_id not in targets and not _free_standing(node):
            issues.append(_issue("disconnected",
                                 f"{node.name} '{node_id}' has no incoming or outgoing sequence flow",
                                 node.line, node.column, node.attrs.get("id")))

    issues.extend(_unreachable(elements, flows, sources, targets))

    outgoing = {}
    for flow in flows:
        outgoing.setdefault(_local_id(flow.attrs.get("sourceRef", "")), []).append(flow)
    for gateway in (e for e in elements if e.ns == BPMN and e.name in DECIDING):
        gateway_id = gateway.attrs.get("id")
        flows_out = outgoing.get(gateway_id, [])
        if len(flows_out) < 2:
            continue
        default = _local_id(gateway.attrs.get("default", ""))
        if not default:
            issues.append(_issue("no-default-flow",
                                 f"{gateway.name} '{gateway_id}' has no default flow",
                                 gateway.line, gateway.column, gateway.attrs.get("id")))
        for flow in flows_out:
            flow_id = flow.attrs.get("id")
            if flow_id != default and not flow.attrs.get("name", "").strip():
                issues.append(_issue("unnamed-condition",
                                     f"sequence flow '{flow_id}' leaves '{gateway_id}' with no name",
                                     flow.line, flow.column, flow.attrs.get("id")))
    return issues


def _unreachable(elements, flows, sources, targets):
    """Connected flow nodes that no path from a start event of their scope reaches."""
    following = {}
    for flow in flows:
        source = _local_id(flow.attrs.get("sourceRef", ""))
        following.setdefault(source, []).append(_local_id(flow.attrs.get("targetRef", "")))
    for element in elements:
        if element.ns == BPMN and element.name == "boundaryEvent":
            host = _local_id(element.attrs.get("attachedToRef", ""))
            following.setdefault(host, []).append(element.attrs.get("id"))

    issues = []
    for scope in (e for e in elements if e.ns == BPMN and e.name in SCOPES):
        nodes = {c.attrs.get("id"): c for c in scope.children
                 if c.ns == BPMN and c.name in FLOW_NODES}
        # Without a start event, BPMN starts every node that has no incoming flow
        roots = [i for i, n in nodes.items() if n.name == "startEvent"] or [
            i for i, n in nodes.items() if i not in targets and n.name != "boundaryEvent"
        ]
        reached = set()
        pending = list(roots)
        while pending:
            node_id = pending.pop()
            if node_id not in reached:
                reached.add(node_id)
                pending.extend(following.get(node_id, []))
        for node_id, node in nodes.items():
            connected = node_id in sources or node_id in targets
            if node_id not in reached and connected and not _free_standing(node):
                issues.append(_issue("unreachable",
                                     f"{node.name} '{node_id}' cannot be reached from a start event",
                                     node.line, node.column, node.attrs.get("id")))
    return issues


def _free_standing(node):
    """Nodes that BPMN lets stand without sequence flows."""
    if node.name == "boundaryEvent" or node.attrs.get("isForCompensation") == "true":
        return True
    if node.name == "subProcess" and node.attrs.get("triggeredByEvent") == "true":
        return True
    parent = node.parent
    return parent is not None and parent.name == "adHocSubProcess"
