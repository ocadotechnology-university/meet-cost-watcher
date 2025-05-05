from .meetings import api as meeting_ns


def register_namespaces(api):
    api.add_namespace(meeting_ns, path="/meetings")
