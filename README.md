# Music streaming platform 

Api for the music streaming app. my goal with this was to learn all the underlaying conceptes of some library,
I'm using less as possible of them.

I have **itentionally** put with it the '.env' for it to be easy to clone and run.

I have not yet created a seeder for this so you have to manually upload songs, and manually create users

install 
```npm install```

create a database in your postgresql with it's name (at the end of the db url in the .env)
then do a migration

migrate
```npx prisma migrate dev --name name```

launch
```npm run dev```
