from .meetings import api as meeting_ns
from .costs import api as costs_ns


def register_namespaces(api):
    api.add_namespace(meeting_ns, path="/meetings")
    api.add_namespace(costs_ns, path="/costs")
