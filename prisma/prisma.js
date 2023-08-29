// instantiate the Prisma Client once and share the instance across your application.
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
module.exports = prisma
