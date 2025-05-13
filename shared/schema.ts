import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for Discord users
export const users = pgTable("users", {
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
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  traitType: text("trait_type").notNull(), // kurumsal, çalkantılı, sansasyonel
  players: jsonb("players").default([]),
});

// Players table for players in teams
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  position: text("position").notNull(),
  jerseyNumber: integer("jersey_number").notNull(),
  mood: integer("mood").default(50),
  teamId: integer("team_id").notNull(),
});

// Game session to track active press conferences, decisions, etc.
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionType: text("session_type").notNull(), // 'basin', 'karar', etc.
  sessionData: jsonb("session_data").default({}),
  isActive: boolean("is_active").default(true),
  createdAt: text("created_at").notNull(),
});

// Team ownership table to track which user owns which team
export const teamOwnership = pgTable("team_ownership", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id").notNull().unique(),
  userId: integer("user_id").notNull(),
  assignedAt: text("assigned_at").notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).omit({
  id: true,
});

export const insertTeamOwnershipSchema = createInsertSchema(teamOwnership).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Team = typeof teams.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type GameSession = typeof gameSessions.$inferSelect;

export type InsertTeamOwnership = z.infer<typeof insertTeamOwnershipSchema>;
export type TeamOwnership = typeof teamOwnership.$inferSelect;

// Type for press conference results
export type PressConferenceResult = {
  fanSupportChange: number;
  managementTrustChange: number;
  mediaComment: string;
  managementReaction: string;
  gossip?: string;
};

// Type for decision event results
export type DecisionResult = {
  fanSupportChange: number;
  managementTrustChange: number;
  teamMoraleChange: number;
  message: string;
  title?: string;
};

// Type for player interaction results
export type PlayerInteractionResult = {
  playerMoodChange: number;
  teamMoraleChange: number;
  mediaReaction?: string;
  message: string;
};

// Type for media gossips
export type GossipItem = {
  title: string;
  content: string;
  risk: 'low' | 'medium' | 'high';
  impact: {
    fanSupport: number;
    managementTrust: number;
    teamMorale: number;
  };
};

// Type for tactical formations
export type Formation = {
  name: string;
  positions: string[];
  mediaAnalysis: string[];
};

// Type for press conference questions
export type PressQuestion = {
  question: string;
  context: string;
  category: 'tactical' | 'player' | 'rival' | 'result' | 'club' | 'general';
  positiveKeywords: string[];
  negativeKeywords: string[];
};
