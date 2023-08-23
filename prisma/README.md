npm i -D prisma
npm i @prisma/client
npx prisma init
Next steps:
1. Set the DATABASE_URL in the .env file to point to your existing database. If your database has no tables yet, read https://pris.ly/d/getting-started
2. Set the provider of the datasource block in schema.prisma to match your database: postgresql, mysql, sqlite, sqlserver, mongodb or cockroachdb.
3. Run prisma db pull to turn your database schema into a Prisma schema.
4. Run prisma generate to generate the Prisma Client. You can then start querying your database.

More information in our documentation:
https://pris.ly/d/getting-started

prisma studio

# DB SET UP
Both npx prisma migrate dev and prisma db pull are Prisma CLI commands used for database schema management, but they serve different purposes and are used in different contexts.

1. npx prisma migrate dev:

This command is used to create and apply database migrations in your Prisma project. Migrations are a way to manage changes to your database schema over time. When you run npx prisma migrate dev, Prisma performs the following steps:

It analyzes your Prisma schema file to detect any changes you've made to your data model.
It generates a migration that represents the changes you've made.
It applies the generated migration to your database.
In other words, npx prisma migrate dev is used to keep your database schema in sync with your Prisma schema and your application's data model.

2. prisma db pull:

This command is used to pull the database schema from your database and update your Prisma schema accordingly. It's particularly useful when you want to reflect changes that have been made directly in the database, outside of your Prisma schema. Running prisma db pull performs the following:

It reads the structure of the database tables, columns, indexes, and relationships.
It updates your Prisma schema file to match the actual database schema.
In other words, prisma db pull is used to align your Prisma schema with the current state of your database schema.

Key Differences:

Purpose:

npx prisma migrate dev is used for managing schema changes and generating and applying migrations.
prisma db pull is used for updating your Prisma schema to match the current state of the database schema.
Workflow:

Use npx prisma migrate dev when you're making changes to your Prisma schema and need to create and apply migrations.
Use prisma db pull when you've made changes directly in the database and want to update your Prisma schema to reflect those changes.
Usage:

npx prisma migrate dev is typically run in your terminal as a single command.
prisma db pull can be run in your terminal, but it can also be used interactively as part of the Prisma Studio interface.
In summary, the choice between these commands depends on the context of the changes you're dealing with. If you're modifying your Prisma schema, use npx prisma migrate dev. If you need to update your Prisma schema to match changes made directly in the database, use prisma db pull.


## Use npx prisma migrate dev to update DB
npx prisma migrate dev

1. run npx prisma migrate dev
2. name migration-{1,2,..}
FYI:
You'll notice an updated prisma client is generated node_modules/@prisma/client

You can see the new models in
node_modules/.prisma/client/index.js

Which enables code auto-completion 