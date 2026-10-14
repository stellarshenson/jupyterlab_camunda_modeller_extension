import json

from jupyter_server.base.handlers import APIHandler
from jupyter_server.utils import url_path_join
import tornado

from .validate import validate


class HelloRouteHandler(APIHandler):
    # The following decorator should be present on all verb methods (head, get, post,
    # patch, put, delete, options) to ensure only authorized user can request the
    # Jupyter server
    @tornado.web.authenticated
    def get(self):
        self.finish(json.dumps({
            "data": (
                "Hello, world!"
                " This is the '/jupyterlab-camunda-modeller-extension/hello' endpoint."
                " Try visiting me in your browser!"
            ),
        }))


class ValidateRouteHandler(APIHandler):
    """Runs the bpmn-validate checks on the posted diagram text."""

    @tornado.web.authenticated
    def post(self):
        content = (self.get_json_body() or {}).get("content", "")
        self.finish(json.dumps({"issues": [vars(issue) for issue in validate(content)]}))


def setup_route_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]

    hello_route_pattern = url_path_join(base_url, "jupyterlab-camunda-modeller-extension", "hello")
    validate_route_pattern = url_path_join(base_url, "jupyterlab-camunda-modeller-extension", "validate")
    handlers = [
        (hello_route_pattern, HelloRouteHandler),
        (validate_route_pattern, ValidateRouteHandler),
    ]

    web_app.add_handlers(host_pattern, handlers)
