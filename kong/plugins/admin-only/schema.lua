local typedefs = require "kong.db.schema.typedefs"

return {
    name = "admin-only",

    fields = {
        {
            config = {
                type = "record",
                fields = {
                },
            },
        },
    },
}