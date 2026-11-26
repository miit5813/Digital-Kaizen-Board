import {prisma} from '../db.js'

export async function getUserAccess(userId) {
    const rows = await prisma.userRole.findMany({
        where: {userId},
        include: {roly: true},
    })
    
    return {
        roles: rows.map((r) => r.role.name),
        permissions: [...new Set(rows.flatMap((r) => r.role.permissions))]
    }
}