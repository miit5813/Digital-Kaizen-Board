import 'dotenv/config'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcryptjs'
import { ROLE_TEMPLATES } from '../src/permissions'

const prisma = new PrismaClient()

async function main() {
    const roles = {}
    for (const t of ROLE_TEMPLATES) {
        roles[t.name] = await prisma.role.upsert({
            where: {name: t.name},
            update: {permissions: t.permissions},
            create: {...t, isSystem: true},
        })
    }

    const password = process.env.SEED_ADMIN_PASSWORD || 'admin12345'
    const passwordHash = await bcrypt.hash(password,10)
    const admin = await prisma.user.upsert({
        where: {login: 'admin'},
        update: {},
        create: {
            login: 'admin', passwordHash,
            fullName: 'Администратор'
        },
    })

    await prisma.userRole.upsert({
        where: {userId_roleID: {userId: admin.id, roleID: roles['Администратор'].id},
    },
    update: {},
    create: {userId: admin.id, roleId: roles['Администратор'].id}
    })
    console.log('Админит готов:' + admin.login)
}
main()
    .catch((e) => {
        console.error(e)
        process.exit(1)

    })
    .finally( async () => {
        await prisma.$disconnect
    })