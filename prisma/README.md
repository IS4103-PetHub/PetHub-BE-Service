## Database Setup with Prisma
### Initial Setup
1. Set DATABASE_URL in the .env file to connect to your database. If your database is empty, refer to Prisma's Getting Started Guide.
2. Update Prisma schema from your database:
```prisma db pull```
3. Generate the Prisma Client:
```prisma generate```
- An updated Prisma client will be generated at node_modules/@prisma/client.
- New models can be found in node_modules/.prisma/client/index.js for code auto-completion.


### Updating Schemas
- Avoid Direct Modifications: Do not directly edit schema.prisma.
- Separate Schema Files: Construct individual schemas in separate files. For instance, user-related schemas should be in prisma/subschemas/user/user.prisma.
- Collate Schemas: To consolidate all modifications across prisma files and automatically generate a new schema.prisma, run:
```npx prisma-multischema```

#### VSCode Extension for Prisma
- Install: Ensure you have the prisma import extension added to VSCode.
- Other Extensions: Disable any other Prisma-related extensions to prevent conflicts.
- Benefits: The 'prisma import' extension enables seamless importing of prisma files throughout your project.


### Database Migrations
#### Use migrations to manage schema changes
```npx prisma migrate dev```

Name the migration (e.g., migration-1, migration-2).

This command:
- Detects data model changes in your schema.prisma
- Creates a migration for these changes.
- Applies this migration to your database.

#### To reflect direct database changes in Prisma schema
To sync Prisma schema with direct changes in the database
```prisma db pull```
This aligns your Prisma schema with your database schema.

#### Manually Seed DB
```prisma db seed```

#### Prisma Web Client (Studio)
```npx prisma studio```
Prisma studio should be up on http://localhost:5555


## More information in our documentation:
- Prisma: https://pris.ly/d/getting-started
- Prisma Import: https://marketplace.visualstudio.com/items?itemName=ajmnz.prisma-import
- Prisma MultiSchema: https://medium.com/@joydip007x/how-to-use-multiple-schema-in-prisma-40cc6b6f8d9c