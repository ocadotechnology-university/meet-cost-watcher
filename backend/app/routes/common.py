from flask_restx import fields


def build_return_type(api, model_name: str, restx_model):

    return api.model(
        model_name,
        {
            "status": fields.String(
                enum=["success", "error"],
                description="Indicates the status of response",
                required=True
            ),
            "content": fields.Nested(
                restx_model,
                description="content of succesfull response, if error this is a string",
                required=True
            ),
        },
    )
