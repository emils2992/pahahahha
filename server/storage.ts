import fs from 'node:fs';
import path from 'node:path';
import { 
  users, teams, players, gameSessions, teamOwnership,
  type User, type InsertUser, 
  type Team, type InsertTeam, 
  type Player, type InsertPlayer,
  type GameSession, type InsertGameSession,
  type TeamOwnership, type InsertTeamOwnership,
  type PressConferenceResult, type DecisionResult,
  type PlayerInteractionResult, type GossipItem, type Formation
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
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
  checkCommandTimeout(discordId: string, commandName: string, timeoutMinutes: number): Promise<boolean>;
  checkMonthlyPointLimit(discordId: string, pointsToAdd: number): Promise<boolean>;
  
  // Team operations
  getTeam(id: number): Promise<Team | undefined>;
  getTeamByName(name: string): Promise<Team | undefined>;
  getAllTeams(): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  getTeamOwner(teamId: number): Promise<User | undefined>;
  isTeamOwned(teamName: string): Promise<boolean>;
  assignTeamToUser(teamId: number, userId: number): Promise<TeamOwnership>;
  
  // Player operations
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTeamId(teamId: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerMood(id: number, moodChange: number): Promise<Player | undefined>;
  deletePlayer(id: number): Promise<boolean>;
  
  // Game session operations
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(id: number): Promise<GameSession | undefined>;
  getAllGameSessions(): Promise<GameSession[]>;
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
  private teamOwnerships: Map<number, TeamOwnership>;
  
  private userIdCounter: number;
  private teamIdCounter: number;
  private playerIdCounter: number;
  private gameSessionIdCounter: number;
  private teamOwnershipIdCounter: number;
  
  // Team ownership methods implementation
  async getTeamOwner(teamId: number): Promise<User | undefined> {
    const ownership = Array.from(this.teamOwnerships.values()).find(
      (ownership) => ownership.teamId === teamId
    );
    
    if (!ownership) return undefined;
    return this.users.get(ownership.userId);
  }
  
  async isTeamOwned(teamName: string): Promise<boolean> {
    const team = await this.getTeamByName(teamName);
    if (!team) return false;
    
    const ownership = Array.from(this.teamOwnerships.values()).find(
      (ownership) => ownership.teamId === team.id
    );
    
    return !!ownership;
  }
  
  async assignTeamToUser(teamId: number, userId: number): Promise<TeamOwnership> {
    const id = this.teamOwnershipIdCounter++;
    const ownership: TeamOwnership = { 
      id, 
      teamId, 
      userId, 
      assignedAt: new Date().toISOString() 
    };
    
    this.teamOwnerships.set(id, ownership);
    this.saveData(); // Değişiklikleri hemen kaydet
    console.log(`assignTeamToUser: Takım sahipliği (${teamId} -> ${userId}) kaydedildi. ID: ${id}`);
    return ownership;
  }
  
  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.players = new Map();
    this.gameSessions = new Map();
    this.teamOwnerships = new Map();
    
    this.userIdCounter = 1;
    this.teamIdCounter = 1;
    this.playerIdCounter = 1;
    this.gameSessionIdCounter = 1;
    this.teamOwnershipIdCounter = 1;
    
    // Try to load data from storage
    const dataLoaded = this.loadData();
    
    // If no data was loaded or teams are missing, initialize default teams
    if (!dataLoaded || this.teams.size === 0) {
      this.initializeDefaultTeams();
      // Save initial data to files
      this.saveData();
    }
    
    // Set up auto-save every 5 minutes
    setInterval(() => {
      this.saveData();
    }, 5 * 60 * 1000);
    
    // Save data on process termination
    process.on('SIGINT', () => {
      console.log('Uygulama kapatılıyor, veriler kaydediliyor...');
      this.saveData();
      process.exit(0);
    });
  }
  
  // Veri kaydetme işlemi
  private saveData(): void {
    try {
      // Klasör var mı kontrol et, yoksa oluştur
      const dataDir = './data';
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      // Veri yapılarını JSON dizilerine dönüştür
      const usersData = Array.from(this.users.values());
      const teamsData = Array.from(this.teams.values());
      const playersData = Array.from(this.players.values());
      const gameSessionsData = Array.from(this.gameSessions.values());
      const teamOwnershipsData = Array.from(this.teamOwnerships.values());
      
      // Sayaçları dışa aktar
      const counters = {
        userIdCounter: this.userIdCounter,
        teamIdCounter: this.teamIdCounter,
        playerIdCounter: this.playerIdCounter,
        gameSessionIdCounter: this.gameSessionIdCounter,
        teamOwnershipIdCounter: this.teamOwnershipIdCounter
      };
      
      // Dosyalara yaz
      fs.writeFileSync(path.join(dataDir, 'users.json'), JSON.stringify(usersData, null, 2));
      fs.writeFileSync(path.join(dataDir, 'teams.json'), JSON.stringify(teamsData, null, 2));
      fs.writeFileSync(path.join(dataDir, 'players.json'), JSON.stringify(playersData, null, 2));
      fs.writeFileSync(path.join(dataDir, 'game_sessions.json'), JSON.stringify(gameSessionsData, null, 2));
      fs.writeFileSync(path.join(dataDir, 'team_ownerships.json'), JSON.stringify(teamOwnershipsData, null, 2));
      fs.writeFileSync(path.join(dataDir, 'counters.json'), JSON.stringify(counters, null, 2));
      
      console.log('Veriler başarıyla kaydedildi.');
      console.log(`İstatistikler: ${usersData.length} kullanıcı, ${teamsData.length} takım, ${teamOwnershipsData.length} takım sahipliği`);
    } catch (error) {
      console.error('Veri kaydedilirken hata oluştu:', error);
    }
  }
  
  // Veri yükleme işlemi
  private loadData(): boolean {
    try {
      // Ana veri dizini
      const dataDir = './data';
      
      // Gerekli tüm dosyaların varlığını kontrol et
      const requiredFiles = [
        'users.json',
        'teams.json',
        'players.json',
        'game_sessions.json',
        'team_ownerships.json',
        'counters.json'
      ];
      
      // Veri dizini var mı kontrol et
      if (!fs.existsSync(dataDir)) {
        console.log(`${dataDir} dizini bulunamadı, default veriler kullanılacak.`);
        return false;
      }
      
      // Eğer bir dosya eksikse false döndür
      for (const file of requiredFiles) {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) {
          console.log(`${filePath} bulunamadı, default veriler kullanılacak.`);
          return false;
        }
      }
      
      // Dosyalardan veri yükle
      const usersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8')) as User[];
      const teamsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'teams.json'), 'utf8')) as Team[];
      const playersData = JSON.parse(fs.readFileSync(path.join(dataDir, 'players.json'), 'utf8')) as Player[];
      const gameSessionsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'game_sessions.json'), 'utf8')) as GameSession[];
      const teamOwnershipsData = JSON.parse(fs.readFileSync(path.join(dataDir, 'team_ownerships.json'), 'utf8')) as TeamOwnership[];
      const counters = JSON.parse(fs.readFileSync(path.join(dataDir, 'counters.json'), 'utf8')) as {
        userIdCounter: number;
        teamIdCounter: number;
        playerIdCounter: number;
        gameSessionIdCounter: number;
        teamOwnershipIdCounter: number;
      };
      
      // Veri yapılarını temizle ve sonra yükle
      this.users.clear();
      this.teams.clear();
      this.players.clear();
      this.gameSessions.clear();
      this.teamOwnerships.clear();
      
      // Map veri yapılarını oluştur
      for (const user of usersData) {
        // null değerler yerine varsayılan değerler atayalım
        const processedUser: User = {
          id: user.id,
          discordId: user.discordId,
          username: user.username,
          currentTeam: user.currentTeam || null,
          fanSupport: user.fanSupport !== null && user.fanSupport !== undefined ? user.fanSupport : 50,
          managementTrust: user.managementTrust !== null && user.managementTrust !== undefined ? user.managementTrust : 50,
          teamMorale: user.teamMorale !== null && user.teamMorale !== undefined ? user.teamMorale : 50,
          titles: Array.isArray(user.titles) ? user.titles : [],
          points: user.points !== null && user.points !== undefined ? user.points : 0,
          monthlyPoints: user.monthlyPoints !== null && user.monthlyPoints !== undefined ? user.monthlyPoints : 0,
          lastPointReset: user.lastPointReset || new Date().toISOString(), 
          lastActionTime: user.lastActionTime || {},
          seasonRecords: user.seasonRecords || {},
          createdAt: user.createdAt
        };
        this.users.set(user.id, processedUser);
      }
      
      for (const team of teamsData) {
        const processedTeam: Team = {
          id: team.id,
          name: team.name,
          traitType: team.traitType,
          players: team.players || []
        };
        this.teams.set(team.id, processedTeam);
      }
      
      for (const player of playersData) {
        const processedPlayer: Player = {
          id: player.id,
          name: player.name,
          position: player.position,
          jerseyNumber: player.jerseyNumber,
          teamId: player.teamId,
          mood: player.mood !== null && player.mood !== undefined ? player.mood : 50
        };
        this.players.set(player.id, processedPlayer);
      }
      
      for (const session of gameSessionsData) {
        const processedSession: GameSession = {
          id: session.id,
          createdAt: session.createdAt,
          userId: session.userId,
          sessionType: session.sessionType,
          sessionData: session.sessionData || {},
          isActive: session.isActive !== null && session.isActive !== undefined ? session.isActive : false
        };
        this.gameSessions.set(session.id, processedSession);
      }
      
      for (const ownership of teamOwnershipsData) {
        this.teamOwnerships.set(ownership.id, ownership);
      }
      
      // Sayaçları yükle
      this.userIdCounter = counters.userIdCounter;
      this.teamIdCounter = counters.teamIdCounter;
      this.playerIdCounter = counters.playerIdCounter;
      this.gameSessionIdCounter = counters.gameSessionIdCounter;
      this.teamOwnershipIdCounter = counters.teamOwnershipIdCounter;
      
      // Kontrol amaçlı bilgileri yazdıralım
      const loadedUserCount = this.users.size;
      const loadedTeamCount = this.teams.size;
      const loadedTeamOwnershipCount = this.teamOwnerships.size;
      console.log(`Veriler başarıyla yüklendi: ${loadedUserCount} kullanıcı, ${loadedTeamCount} takım, ${loadedTeamOwnershipCount} takım sahipliği.`);
      return true;
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      return false;
    }
  }
  
  // User operations
  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.discordId === discordId
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    this.saveData(); // Değişiklikleri hemen kaydet
    console.log(`createUser: Yeni kullanıcı oluşturuldu: ${insertUser.username} (ID: ${id})`);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    this.saveData(); // Değişiklikleri hemen kaydet
    console.log(`updateUser: Kullanıcı güncellendi: ${user.username} (ID: ${id})`);
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
    
    // Değişiklikleri konsola yazdır
    console.log(`STAT CHANGES for ${discordId}:`);
    console.log(`  Fan Support: ${user.fanSupport || 50} -> ${(user.fanSupport || 50) + fanSupportChange} (${fanSupportChange > 0 ? '+' : ''}${fanSupportChange})`);
    console.log(`  Management Trust: ${user.managementTrust || 50} -> ${(user.managementTrust || 50) + managementTrustChange} (${managementTrustChange > 0 ? '+' : ''}${managementTrustChange})`);
    console.log(`  Team Morale: ${user.teamMorale || 50} -> ${(user.teamMorale || 50) + teamMoraleChange} (${teamMoraleChange > 0 ? '+' : ''}${teamMoraleChange})`);
    
    // Apply changes with limits (0-100)
    const newFanSupport = Math.max(0, Math.min(100, (user.fanSupport || 50) + fanSupportChange));
    const newManagementTrust = Math.max(0, Math.min(100, (user.managementTrust || 50) + managementTrustChange));
    const newTeamMorale = Math.max(0, Math.min(100, (user.teamMorale || 50) + teamMoraleChange));
    
    const updatedUser = {
      ...user,
      fanSupport: newFanSupport,
      managementTrust: newManagementTrust,
      teamMorale: newTeamMorale
    };
    
    this.users.set(user.id, updatedUser);
    this.saveData(); // Değişiklikleri hemen kaydet
    
    // Kontrol et - eğer değerlerden herhangi biri 25'in altına düşerse, kullanıcı kovulur
    // Kovulma durumunda, kullanıcının takım üyeliğini sıfırla
    const MIN_THRESHOLD = 25;
    if (newFanSupport < MIN_THRESHOLD || newManagementTrust < MIN_THRESHOLD || newTeamMorale < MIN_THRESHOLD) {
      console.log(`Kullanıcı ${discordId} kritik değerlerin altına düştüğü için kovuldu!`);
      
      // Takımdan kovulduğunu belirtmek için takım bağlantısını sıfırla
      updatedUser.currentTeam = null;
      
      // İstatistikleri default başlangıç değerlerine sıfırla (50)
      updatedUser.fanSupport = 50;
      updatedUser.managementTrust = 50;
      updatedUser.teamMorale = 50;
      
      this.users.set(user.id, updatedUser);
      this.saveData(); // Değişiklikleri hemen kaydet
      
      // Not: Gerçek bir uygulamada burada kullanıcıya kovulduğuna dair bildirim gönderilirdi
    }
    
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
    // Bilgi amaçlı puan değişimini konsola yazdır
    console.log(`POINTS CHANGES for ${discordId}: Adding ${points} points`);
    
    // Check command timeout first (6 saatte bir puan kazanabilir)
    const canEarnPoints = await this.checkCommandTimeout(discordId, "pointEarning", 360); // 6 saat = 360 dakika
    if (!canEarnPoints) {
      console.log(`Kullanıcı ${discordId} henüz yeni puan kazanamaz. Zaman sınırlaması var.`);
      return this.getUserByDiscordId(discordId);
    }
    
    // Check monthly point limit
    const withinMonthlyLimit = await this.checkMonthlyPointLimit(discordId, points);
    if (!withinMonthlyLimit) {
      console.log(`Kullanıcı ${discordId} aylık puan limitine ulaştı.`);
      return this.getUserByDiscordId(discordId);
    }
    
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return undefined;
    
    // Güncel puanlarını göster
    console.log(`  Mevcut puan: ${user.points || 0}`);
    
    // Update monthly points as well as total points
    const updatedMonthlyPoints = (user.monthlyPoints || 0) + points;
    const updatedUser = { 
      ...user, 
      points: (user.points || 0) + points,
      monthlyPoints: updatedMonthlyPoints
    };
    
    // Yeni puanları göster
    console.log(`  Yeni puan: ${updatedUser.points}`);
    
    this.users.set(user.id, updatedUser);
    this.saveData(); // Değişiklikleri hemen kaydet
    return updatedUser;
  }
  
  async checkCommandTimeout(discordId: string, commandName: string, timeoutMinutes: number, isAdmin: boolean = false): Promise<boolean> {
    // Eğer yetkili ise, zaman sınırlamasını atla
    if (isAdmin) {
      return true;
    }
    
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return true; // Kullanıcı bulunamadı, işleme izin ver
    
    // Default lastActionTime boş bir nesne
    const lastActionTime = user.lastActionTime as Record<string, string> || {};
    const lastTime = lastActionTime[commandName];
    
    if (!lastTime) {
      // Bu komut için önceki kayıt yok, izin ver ve zaman damgasını güncelle
      const now = new Date().toISOString();
      const updatedLastActionTime = { ...lastActionTime, [commandName]: now };
      await this.updateUser(user.id, { lastActionTime: updatedLastActionTime });
      return true;
    }
    
    // Yeterli zaman geçmiş mi kontrol et
    const lastTimeDate = new Date(lastTime);
    const now = new Date();
    const diffMs = now.getTime() - lastTimeDate.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    
    if (diffMinutes < timeoutMinutes) {
      // Yeterli zaman geçmemiş
      return false;
    }
    
    // Zaman damgasını güncelle ve işleme izin ver
    const updatedLastActionTime = { ...lastActionTime, [commandName]: now.toISOString() };
    await this.updateUser(user.id, { lastActionTime: updatedLastActionTime });
    return true;
  }
  
  async checkMonthlyPointLimit(discordId: string, pointsToAdd: number): Promise<boolean> {
    const user = await this.getUserByDiscordId(discordId);
    if (!user) return true; // Kullanıcı bulunamadı, işleme izin ver
    
    const monthlyLimit = 100; // Aylık maksimum puan
    const now = new Date();
    
    // Aylık puan sayacını sıfırlama gerekip gerekmediğini kontrol et
    let resetNeeded = false;
    if (!user.lastPointReset) {
      resetNeeded = true;
    } else {
      const lastResetDate = new Date(user.lastPointReset);
      // Son sıfırlamadan bu yana 30 günden fazla zaman geçmiş mi kontrol et
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      if (now.getTime() - lastResetDate.getTime() > thirtyDaysInMs) {
        resetNeeded = true;
      }
    }
    
    if (resetNeeded) {
      // Gerekirse aylık puanları sıfırla
      await this.updateUser(user.id, { 
        monthlyPoints: 0, 
        lastPointReset: now.toISOString() 
      });
      return true; // Sıfırlamadan sonra işleme izin ver
    }
    
    // Bu puanları eklemek aylık limiti aşar mı kontrol et
    const currentMonthlyPoints = user.monthlyPoints || 0;
    if (currentMonthlyPoints + pointsToAdd > monthlyLimit) {
      return false; // Limit aşılıyor
    }
    
    return true; // Limit dahilinde
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
  
  async deletePlayer(id: number): Promise<boolean> {
    if (!this.players.has(id)) return false;
    return this.players.delete(id);
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
  
  async getAllGameSessions(): Promise<GameSession[]> {
    return Array.from(this.gameSessions.values());
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
      // Premier League teams (2025-2026 season projection)
      { name: "Arsenal", traitType: "sansasyonel", players: [] },
      { name: "Aston Villa", traitType: "kurumsal", players: [] },
      { name: "Burnley", traitType: "kurumsal", players: [] }, // Replaced Bournemouth
      { name: "Brentford", traitType: "kurumsal", players: [] },
      { name: "Brighton", traitType: "kurumsal", players: [] },
      { name: "Chelsea", traitType: "çalkantılı", players: [] },
      { name: "Crystal Palace", traitType: "kurumsal", players: [] },
      { name: "Everton", traitType: "çalkantılı", players: [] },
      { name: "Fulham", traitType: "kurumsal", players: [] },
      { name: "Leeds", traitType: "kurumsal", players: [] },
      { name: "Sheffield United", traitType: "kurumsal", players: [] }, // Replaced Leicester
      { name: "Liverpool", traitType: "sansasyonel", players: [] },
      { name: "Manchester City", traitType: "sansasyonel", players: [] },
      { name: "Manchester United", traitType: "sansasyonel", players: [] },
      { name: "Newcastle", traitType: "çalkantılı", players: [] },
      { name: "Nottingham Forest", traitType: "kurumsal", players: [] },
      { name: "Tottenham", traitType: "çalkantılı", players: [] },
      { name: "West Ham", traitType: "kurumsal", players: [] },
      { name: "Wolves", traitType: "kurumsal", players: [] },
      { name: "Southampton", traitType: "kurumsal", players: [] },
    ];
    
    defaultTeams.forEach(team => {
      const id = this.teamIdCounter++;
      this.teams.set(id, { ...team, id });
    });
    
    // Teams module is no longer needed
    console.log('Takım oyuncuları oluşturuldu!');
  }
}

export const storage = new MemStorage();
