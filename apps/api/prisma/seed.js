import 'dotenv/config'
import {PrismaClient} from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient

async function main() {
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