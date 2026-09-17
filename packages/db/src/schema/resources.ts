import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const resourceSections = pgTable(
  "resource_sections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    markdown: text("markdown").notNull(),
    position: integer("position").notNull(),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    updatedBy: uuid("updated_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date().toISOString()),
  },
  (table) => [
    uniqueIndex("resource_sections_slug_unique").on(table.slug),
    index("resource_sections_position_idx").on(table.position),
    index("resource_sections_created_by_idx").on(table.createdBy),
    index("resource_sections_updated_by_idx").on(table.updatedBy),
    check(
      "resource_sections_title_length_check",
      sql`char_length(trim(${table.title})) between 1 and 120`,
    ),
    check(
      "resource_sections_slug_check",
      sql`char_length(${table.slug}) between 1 and 80 and ${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${table.slug} <> 'additional'`,
    ),
    check(
      "resource_sections_markdown_check",
      sql`char_length(trim(${table.markdown})) > 0 and octet_length(${table.markdown}) <= 65536`,
    ),
    check("resource_sections_position_check", sql`${table.position} >= 0`),
  ],
);

export const resourcePublications = pgTable(
  "resource_publications",
  {
    sectionId: uuid("section_id")
      .primaryKey()
      .references(() => resourceSections.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    markdown: text("markdown").notNull(),
    publishedBy: uuid("published_by")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    publishedAt: timestamp("published_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("resource_publications_slug_unique").on(table.slug),
    index("resource_publications_published_by_idx").on(table.publishedBy),
    check(
      "resource_publications_title_length_check",
      sql`char_length(trim(${table.title})) between 1 and 120`,
    ),
    check(
      "resource_publications_slug_check",
      sql`char_length(${table.slug}) between 1 and 80 and ${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and ${table.slug} <> 'additional'`,
    ),
    check(
      "resource_publications_markdown_check",
      sql`char_length(trim(${table.markdown})) > 0 and octet_length(${table.markdown}) <= 65536`,
    ),
  ],
);

export type ResourceSection = typeof resourceSections.$inferSelect;
export type NewResourceSection = typeof resourceSections.$inferInsert;
export type ResourcePublication = typeof resourcePublications.$inferSelect;
export type NewResourcePublication = typeof resourcePublications.$inferInsert;
