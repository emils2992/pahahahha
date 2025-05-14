import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for Discord users
const users = pgTable("users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  currentTeam: text("current_team"),
  fanSupport: integer("fan_support").default(50),
  managementTrust: integer("management_trust").default(50),
  teamMorale: integer("team_morale").default(50),
  titles: jsonb("titles").default([]),
  points: integer("points").default(0),
  monthlyPoints: integer("monthly_points").default(0), // Aylık puan limiti için
  lastPointReset: text("last_point_reset").default(''), // Son puan reset zamanı
  lastActionTime: jsonb("last_action_time").default({}), // Komut timeout için
  seasonRecords: jsonb("season_records").default([]),
  createdAt: text("created_at").notNull(),
});

// Teams table for managing teams
const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  traitType: text("trait_type").notNull(), // kurumsal, çalkantılı, sansasyonel
  players: jsonb("players").default([]),
});

// Players table for players in teams
const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  jerseyNumber: integer("jersey_number").notNull(),
  mood: integer("mood").default(50),
  teamId: integer("team_id").notNull(),
});

// Game session to track active press conferences, decisions, etc.
const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionType: text("session_type").notNull(), // 'basin', 'karar', etc.
  sessionData: jsonb("session_data").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").notNull(),
});

// Team ownership table to track which user owns which team
const teamOwnership = pgTable("team_ownership", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  assignedAt: text("assigned_at").notNull(),
});

// Insert schemas
const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

const insertTeamSchema = createInsertSchema(teams).omit({
  id: true
});

const insertPlayerSchema = createInsertSchema(players).omit({
  id: true
});

const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true
});

const insertTeamOwnershipSchema = createInsertSchema(teamOwnership).omit({
  id: true
});

// These are just empty interface definitions for JavaScript compatibility
// No actual types in JS, but we keep them for documentation
const PressConferenceResultShape = {
  fanSupportChange: 0,
  managementTrustChange: 0,
  mediaComment: '',
  managementReaction: '',
  gossip: undefined
};

const DecisionResultShape = {
  fanSupportChange: 0,
  managementTrustChange: 0,
  teamMoraleChange: 0,
  message: '',
  title: undefined
};

const PlayerInteractionResultShape = {
  playerMoodChange: 0,
  teamMoraleChange: 0,
  mediaReaction: undefined,
  message: ''
};

const GossipItemShape = {
  title: '',
  content: '',
  risk: 'low', // 'low', 'medium', 'high'
  impact: {
    fanSupport: 0,
    managementTrust: 0,
    teamMorale: 0
  }
};

const FormationShape = {
  name: '',
  positions: [],
  mediaAnalysis: []
};

const PressQuestionShape = {
  question: '',
  context: '',
  category: 'general', // 'tactical', 'player', 'rival', 'result', 'club', 'general'
  positiveKeywords: [],
  negativeKeywords: []
};

export {
  users,
  teams,
  players,
  gameSessions,
  teamOwnership,
  insertUserSchema,
  insertTeamSchema,
  insertPlayerSchema,
  insertGameSessionSchema,
  insertTeamOwnershipSchema,
  // We export the objects as example shapes
  PressConferenceResultShape,
  DecisionResultShape,
  PlayerInteractionResultShape,
  GossipItemShape,
  FormationShape,
  PressQuestionShape
};