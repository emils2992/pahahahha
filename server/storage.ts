import { 
  users, teams, players, gameSessions, 
  type User, type InsertUser, 
  type Team, type InsertTeam, 
  type Player, type InsertPlayer,
  type GameSession, type InsertGameSession,
  type PressConferenceResult, type DecisionResult,
  type PlayerInteractionResult, type GossipItem, type Formation
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserStats(
    discordId: string, 
    fanSupportChange: number, 
    managementTrustChange: number, 
    teamMoraleChange: number
  ): Promise<User | undefined>;
  addUserTitle(discordId: string, title: string): Promise<User | undefined>;
  addUserPoints(discordId: string, points: number): Promise<User | undefined>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Player operations
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTeamId(teamId: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerMood(id: number, moodChange: number): Promise<Player | undefined>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: number): Promise<GameSession | undefined>;
  getActiveSessionByUserId(userId: number, sessionType: string): Promise<GameSession | undefined>;
  updateGameSession(id: number, sessionData: any): Promise<GameSession | undefined>;
  endGameSession(id: number): Promise<boolean>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private teams: Map<number, Team>;
  private players: Map<number, Player>;
  private gameSessions: Map<number, GameSession>;
  
  private userIdCounter: number;
  private teamIdCounter: number;
  private playerIdCounter: number;
  private gameSessionIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.gameSessions = new Map();
    
    this.userIdCounter = 1;
    this.teamIdCounter = 1;
    this.playerIdCounter = 1;
    this.gameSessionIdCounter = 1;
    
    // Initialize with some default teams
    this.initializeDefaultTeams();
  }
  
  // User operations
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async updateUserStats(
    discordId: string, 
    fanSupportChange: number, 
    managementTrustChange: number, 
    teamMoraleChange: number
  ): Promise<User | undefined> {
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return undefined;
    
    // Apply changes with limits (0-100)
    const updatedUser = {
      ...user,
      fanSupport: Math.max(0, Math.min(100, user.fanSupport + fanSupportChange)),
      managementTrust: Math.max(0, Math.min(100, user.managementTrust + managementTrustChange)),
      teamMorale: Math.max(0, Math.min(100, user.teamMorale + teamMoraleChange))
    };
    
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  async addUserTitle(discordId: string, title: string): Promise<User | undefined> {
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return undefined;
    
    const titles = [...(user.titles as string[] || [])];
    if (!titles.includes(title)) {
      titles.push(title);
    }
    
    const updatedUser = { ...user, titles };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  async addUserPoints(discordId: string, points: number): Promise<User | undefined> {
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return undefined;
    
    const updatedUser = { ...user, points: user.points + points };
    this.users.set(user.id, updatedUser);
    return updatedUser;
  }
  
  // Team operations
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }
  
  async getTeamByName(name: string): Promise<Team | undefined> {
    // Import helper
    const { removeEmojis } = await import('./discord/utils/stringHelpers');
    
    // First try exact match (with emojis)
    let team = Array.from(this.teams.values()).find(
      (team) => team.name.toLowerCase() === name.toLowerCase()
    );
    
    // If not found, try matching without emojis
    if (!team) {
      team = Array.from(this.teams.values()).find(
        (team) => {
          const cleanedTeamName = removeEmojis(team.name);
          const cleanedSearchName = name.trim();
          
          return cleanedTeamName.toLowerCase() === cleanedSearchName.toLowerCase();
        }
      );
    }
    
    return team;
  }
  
  async getAllTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }
  
  async createTeam(insertTeam: InsertTeam): Promise<Team> {
    const id = this.teamIdCounter++;
    const team: Team = { ...insertTeam, id };
    this.teams.set(id, team);
    return team;
  }
  
  // Player operations
  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }
  
  async getPlayersByTeamId(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(
      (player) => player.teamId === teamId
    );
  }
  
  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = this.playerIdCounter++;
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }
  
  async updatePlayerMood(id: number, moodChange: number): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedMood = Math.max(0, Math.min(100, player.mood + moodChange));
    const updatedPlayer = { ...player, mood: updatedMood };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }
  
  // Game session operations
  async createGameSession(insertSession: InsertGameSession): Promise<GameSession> {
    const id = this.gameSessionIdCounter++;
    const session: GameSession = { ...insertSession, id };
    this.gameSessions.set(id, session);
    return session;
  }
  
  async getGameSession(id: number): Promise<GameSession | undefined> {
    return this.gameSessions.get(id);
  }
  
  async getActiveSessionByUserId(userId: number, sessionType: string): Promise<GameSession | undefined> {
    return Array.from(this.gameSessions.values()).find(
      (session) => 
        session.userId === userId && 
        session.sessionType === sessionType && 
        session.isActive
    );
  }
  
  async updateGameSession(id: number, sessionData: any): Promise<GameSession | undefined> {
    const session = this.gameSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { 
      ...session, 
      sessionData: { ...session.sessionData, ...sessionData }
    };
    
    this.gameSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  async endGameSession(id: number): Promise<boolean> {
    const session = this.gameSessions.get(id);
    if (!session) return false;
    
    const updatedSession = { ...session, isActive: false };
    this.gameSessions.set(id, updatedSession);
    return true;
  }
  
  // Initialize with default teams
  private initializeDefaultTeams() {
    const defaultTeams = [
      // Premier League with club emojis
      { name: "🔴 Arsenal", traitType: "sansasyonel", players: [] },
      { name: "🟣 Aston Villa", traitType: "kurumsal", players: [] },
      { name: "⚫ AFC Bournemouth", traitType: "kurumsal", players: [] },
      { name: "🐝 Brentford", traitType: "kurumsal", players: [] },
      { name: "🕊️ Brighton & Hove Albion", traitType: "kurumsal", players: [] },
      { name: "🟤 Burnley", traitType: "kurumsal", players: [] },
      { name: "🔵 Chelsea", traitType: "çalkantılı", players: [] },
      { name: "🦅 Crystal Palace", traitType: "kurumsal", players: [] },
      { name: "⛪ Everton", traitType: "çalkantılı", players: [] },
      { name: "⚪ Fulham", traitType: "kurumsal", players: [] },
      { name: "🟡 Leeds United", traitType: "kurumsal", players: [] },
      { name: "❤️ Liverpool", traitType: "sansasyonel", players: [] },
      { name: "💠 Manchester City", traitType: "sansasyonel", players: [] },
      { name: "🔴 Manchester United", traitType: "sansasyonel", players: [] },
      { name: "⚫ Newcastle United", traitType: "çalkantılı", players: [] },
      { name: "🌲 Nottingham Forest", traitType: "kurumsal", players: [] },
      { name: "🐓 Tottenham Hotspur", traitType: "çalkantılı", players: [] },
      { name: "⚒️ West Ham United", traitType: "kurumsal", players: [] },
      { name: "🐺 Wolverhampton Wanderers", traitType: "kurumsal", players: [] },
      { name: "⚓ Southampton", traitType: "kurumsal", players: [] },
    ];
    
    defaultTeams.forEach(team => {
      const id = this.teamIdCounter++;
      this.teams.set(id, { ...team, id });
    });
  }
}

export const storage = new MemStorage();
