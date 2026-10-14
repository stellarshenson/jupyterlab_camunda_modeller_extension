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
