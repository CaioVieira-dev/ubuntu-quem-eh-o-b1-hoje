import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `quem-eh-o-b1-hoje_${name}`,
);

export const posts = createTable(
  "post",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 256 }),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (example) => ({
    createdByIdIdx: index("created_by_idx").on(example.createdById),
    nameIndex: index("name_idx").on(example.name),
  }),
);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  image: varchar("image", { length: 255 }),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  b1In: many(tickets, { relationName: "b1Id" }),
  b2In: many(tickets, { relationName: "b2Id" }),
  createdTickets: many(tickets, { relationName: "createdBy" }),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

export const tickets = createTable(
  "ticket",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    card: varchar("card", { length: 256 }).notNull(),
    createdById: varchar("created_by", { length: 255 })
      .notNull()
      .references(() => users.id),
    b1Id: varchar("b1Id", { length: 255 }).references(() => users.id),
    b1UpdatedAt: timestamp("b1_updated_at", { withTimezone: true }),
    b2Id: varchar("b2Id", { length: 255 }).references(() => users.id),
    b2UpdatedAt: timestamp("b2_updated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
    company: varchar("company", { length: 256 }).notNull(),
    isClosed: boolean("is_closed").default(false),
  },
  (ticket) => ({
    createdByIdIdx: index("ticket_created_by_idx").on(ticket.createdById),
    cardIndex: index("ticket_card_idx").on(ticket.card),
    b1AndB1UpdatedAtIndex: index("ticket_b1_and_b1_updated_at_idx").on(
      ticket.b1Id,
      ticket.b1UpdatedAt,
    ),
    b2AndB2UpdatedAtIndex: index("ticket_b2_and_b2_updated_at_idx").on(
      ticket.b2Id,
      ticket.b2UpdatedAt,
    ),
    companyIndex: index("ticket_company_idx").on(ticket.company),
  }),
);

export const ticketsRelations = relations(tickets, ({ one }) => ({
  createdBy: one(users, {
    fields: [tickets.createdById],
    references: [users.id],
    relationName: "createdBy",
  }),
  b1: one(users, {
    fields: [tickets.b1Id],
    references: [users.id],
    relationName: "b1Id",
  }),
  b2: one(users, {
    fields: [tickets.b2Id],
    references: [users.id],
    relationName: "b2Id",
  }),
}));
