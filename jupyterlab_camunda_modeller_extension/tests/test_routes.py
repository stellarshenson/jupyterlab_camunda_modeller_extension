import json

import pytest
from tornado.httpclient import HTTPClientError


async def test_hello(jp_fetch):
    # When
    response = await jp_fetch("jupyterlab-camunda-modeller-extension", "hello")

    # Then
    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
            "data": (
                "Hello, world!"
                " This is the '/jupyterlab-camunda-modeller-extension/hello' endpoint."
                " Try visiting me in your browser!"
            ),
        }


async def test_hello_requires_authentication(jp_fetch):
    # When the request carries no token
    with pytest.raises(HTTPClientError) as error:
        await jp_fetch(
            "jupyterlab-camunda-modeller-extension", "hello",
            headers={"Authorization": ""},
        )

    # Then
    assert error.value.code == 403


MISSING_TARGET = """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="D">
  <bpmn:process id="P"><bpmn:startEvent id="S"/><bpmn:sequenceFlow id="F" sourceRef="S" targetRef="Nowhere"/></bpmn:process>
  <bpmndi:BPMNDiagram id="Di"><bpmndi:BPMNPlane id="Pl" bpmnElement="P"/></bpmndi:BPMNDiagram>
</bpmn:definitions>
"""


# ACC-VALID-77
async def test_validate_returns_the_issues_of_the_posted_content(jp_fetch):
    response = await jp_fetch(
        "jupyterlab-camunda-modeller-extension", "validate",
        method="POST", body=json.dumps({"content": MISSING_TARGET}),
    )
    assert response.code == 200
    issues = json.loads(response.body)["issues"]
    missing = [i for i in issues if i["code"] == "missing-reference"]
    assert len(missing) == 1
    assert missing[0]["element"] == "F"
    assert set(missing[0]) == {"severity", "code", "message", "line", "column", "element"}


# ACC-VALID-78
async def test_validate_requires_authentication(jp_fetch):
    with pytest.raises(HTTPClientError) as error:
        await jp_fetch(
            "jupyterlab-camunda-modeller-extension", "validate",
            method="POST", body=json.dumps({"content": MISSING_TARGET}),
            headers={"Authorization": ""},
        )
    assert error.value.code == 403
