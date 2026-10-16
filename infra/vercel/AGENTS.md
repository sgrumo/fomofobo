# Vercel deploy target

`README.md` holds the setup of an environment.

- A new variable that the app reads goes into the "Runtime values" table of `README.md`, with its kind and its value per environment. Then set it in each Vercel target of the table, with each Preview variable bound to its branch. A value set in Vercel alone exists for nobody who reads the repository.
- A credential gets the Sensitive flag in Vercel.
- Each deploy applies its migrations before the new code serves, and the running code serves until the deploy ends. A migration that the running code cannot read needs two deploys: first the code that reads both shapes, then the migration.
- A new environment needs its branch in `vercel.json`, a Turso database, R2 buckets and Preview variables bound to its branch.
- The region of `vercel.json` sits next to the Turso location. Move both, or neither.
- A build step that writes a database runs on the branches of `vercel.json` alone, each against the database of its own environment.
