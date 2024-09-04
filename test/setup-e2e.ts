import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { execSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const prisma = new PrismaClient()

function generateUniqueDatabaseURL(shemaId: string) {
    if(!process.env.DATABASE_URL) {
        throw new Error("Please provider a DATABASE_URL enviroment variable")
    }

    const url = new URL(process.env.DATABASE_URL)
    url.searchParams.set('schema', shemaId)

    return url.toString()
}

const schemaId = randomUUID()

beforeAll(async () => {
    const databaseURL = generateUniqueDatabaseURL(schemaId)
    process.env.DATABASE_URL = databaseURL

    execSync('pnpm prisma migrate deploy')
})

afterAll(async () => {
    await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`)
    await prisma.$disconnect()
})