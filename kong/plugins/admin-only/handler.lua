local AdminOnlyHandler = {
    PRIORITY = 900,
    VERSION = "1.0.0",
}

function AdminOnlyHandler:access(conf)

    if kong.request.get_method() == "OPTIONS" then
        return
    end

    local consumer = kong.client.get_consumer()

    if consumer then
        kong.log.notice("CONSUMER ENCONTRADO")

        for k, v in pairs(consumer) do
            kong.log.notice("CONSUMER FIELD: ", tostring(k), " = ", tostring(v))
        end
    else
        kong.log.notice("CONSUMER = NIL")
    end

    local credential = kong.client.get_credential()

    if credential then
        kong.log.notice("CREDENTIAL ENCONTRADA")

        for k, v in pairs(credential) do
            kong.log.notice(
                "CREDENTIAL FIELD: ",
                tostring(k),
                " = ",
                tostring(v)
            )
        end
    else
        kong.log.notice("CREDENTIAL = NIL")
    end

end

return AdminOnlyHandler