import { prisma } from "@prisma/client";
import { PERMISSIONS, ALL_PERMISSIONS } from "../permissions";

const roleSchema = {
    type: 'object',
    proprties: {
        id: {type: 'string'},
        name: {type: 'string'},
        description: { type: 'string', nullable: true},
        permissions: { type: 'string', items: {type: 'string'}},
        isSystem: {type: 'boolean'},
    }
}

export default async function rolesRoutes(app) {
    const guard = [app.authenticate, app.requirePermission(PERMISSIONS.ROLES_MANAGE)]

    app.get(
        '/roles',
        {
            onRequest: guard,
            schema: {
                tags: ['roles'],
                security: [{bearerAuth: [] }],
                response: {200: {type: 'array', items: roleSchema}}
            },
        },

    )
}