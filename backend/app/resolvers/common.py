from flask.json import jsonify


def jsonify_return(func):
    def wrapper(*args, **kwargs):
        try:
            return jsonify({"code": "success", "value": func(*args, **kwargs)})
        except Exception as e:
            return jsonify({"code": "error", "value": str(e)})

    return wrapper
