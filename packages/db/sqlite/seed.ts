import { participantsDb } from "./client.js";
import { participants } from "./schema.js";
import list from "./participants.json" with {type:"json"}; // string[] of regnos

for (const regno of list as string[]) {
  await participantsDb.insert(participants)
    .values({ regno: regno.toUpperCase().trim(), createdAt: new Date() })
    .onConflictDoNothing();
}
console.log(`Seeded ${list.length} participants`);