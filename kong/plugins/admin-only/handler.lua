local AdminOnlyHandler = {
    PRIORITY = 900,
    VERSION = "1.0.0",
}

function AdminOnlyHandler:access(conf)
    local jwt_claims = kong.ctx.shared.jwt_claims

    if not jwt_claims then
        return kong.response.exit(401, {
            message = "JWT não encontrado"
        })
    end

    if jwt_claims.is_superuser ~= true then
        return kong.response.exit(403, {
            message = "Acesso permitido somente para administradores"
        })
    end
end

return AdminOnlyHandler