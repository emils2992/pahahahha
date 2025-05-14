import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'url';
import { 
  users, teams, players, gameSessions, teamOwnership
} from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory storage implementation
class MemStorage {
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
    
    // Load stored data if available
    this.loadData();
    
    // Initialize default teams if no teams are loaded
    if (this.teams.size === 0) {
      this.initializeDefaultTeams();
    }
  }
  
  // Save data to file
  saveData() {
    try {
      const dataDir = path.join(process.cwd(), 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      
      const data = {
        users: Array.from(this.users.values()),
        teams: Array.from(this.teams.values()),
        players: Array.from(this.players.values()),
        gameSessions: Array.from(this.gameSessions.values()),
        teamOwnerships: Array.from(this.teamOwnerships.values()),
        counters: {
          userId: this.userIdCounter,
          teamId: this.teamIdCounter,
          playerId: this.playerIdCounter,
          gameSessionId: this.gameSessionIdCounter,
          teamOwnershipId: this.teamOwnershipIdCounter
        }
      };
      
      fs.writeFileSync(
        path.join(dataDir, 'storage.json'),
        JSON.stringify(data, null, 2)
      );
      
      console.log('Veriler başarıyla kaydedildi.');
      console.log(`İstatistikler: ${this.users.size} kullanıcı, ${this.teams.size} takım, ${this.teamOwnerships.size} takım sahipliği`);
      
      return true;
    } catch (error) {
      console.error('Veri kaydetme hatası:', error);
      return false;
    }
  }
  
  // Load data from file
  loadData() {
    try {
      const filePath = path.join(process.cwd(), 'data', 'storage.json');
      if (!fs.existsSync(filePath)) {
        return false;
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      // Clear existing data
      this.users.clear();
      this.teams.clear();
      this.players.clear();
      this.gameSessions.clear();
      this.teamOwnerships.clear();
      
      // Load users
      if (data.users && Array.isArray(data.users)) {
        data.users.forEach(user => {
          const processedUser = {
            id: user.id,
            discordId: user.discordId,
            username: user.username,
            currentTeam: user.currentTeam || null,
            fanSupport: user.fanSupport || 50,
            managementTrust: user.managementTrust || 50,
            teamMorale: user.teamMorale || 50,
            titles: user.titles || [],
            points: user.points || 0,
            monthlyPoints: user.monthlyPoints || 0,
            lastPointReset: user.lastPointReset || '',
            lastActionTime: user.lastActionTime || {},
            seasonRecords: user.seasonRecords || {},
            createdAt: user.createdAt
          };
          this.users.set(user.id, processedUser);
        });
      }
      
      // Load teams
      if (data.teams && Array.isArray(data.teams)) {
        data.teams.forEach(team => {
          const processedTeam = {
            id: team.id,
            name: team.name,
            traitType: team.traitType || 'default',
            players: team.players || []
          };
          this.teams.set(team.id, processedTeam);
        });
      }
      
      // Load players
      if (data.players && Array.isArray(data.players)) {
        data.players.forEach(player => {
          const processedPlayer = {
            id: player.id,
            name: player.name,
            position: player.position,
            jerseyNumber: player.jerseyNumber,
            mood: player.mood || 50,
            teamId: player.teamId
          };
          this.players.set(player.id, processedPlayer);
        });
      }
      
      // Load game sessions
      if (data.gameSessions && Array.isArray(data.gameSessions)) {
        data.gameSessions.forEach(session => {
          const processedSession = {
            id: session.id,
            userId: session.userId,
            sessionType: session.sessionType,
            sessionData: session.sessionData || {},
            isActive: session.isActive,
            createdAt: session.createdAt
          };
          this.gameSessions.set(session.id, processedSession);
        });
      }
      
      // Load team ownerships
      if (data.teamOwnerships && Array.isArray(data.teamOwnerships)) {
        data.teamOwnerships.forEach(ownership => {
          this.teamOwnerships.set(ownership.id, ownership);
        });
      }
      
      // Set counters
      if (data.counters) {
        this.userIdCounter = data.counters.userId || 1;
        this.teamIdCounter = data.counters.teamId || 1;
        this.playerIdCounter = data.counters.playerId || 1;
        this.gameSessionIdCounter = data.counters.gameSessionId || 1;
        this.teamOwnershipIdCounter = data.counters.teamOwnershipId || 1;
      }
      
      console.log(`Veriler başarıyla yüklendi: ${this.users.size} kullanıcı, ${this.teams.size} takım, ${this.teamOwnerships.size} takım sahipliği.`);
      return true;
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      return false;
    }
  }
  
  // Team ownership operations
  async getTeamOwner(teamId) {
    try {
      // Find the ownership record for this team
      const ownership = Array.from(this.teamOwnerships.values())
        .find(o => o.teamId === teamId);
      
      if (!ownership) {
        return undefined;
      }
      
      // Get the user
      return this.users.get(ownership.userId);
    } catch (error) {
      console.error('getTeamOwner error:', error);
      return undefined;
    }
  }
  
  async isTeamOwned(teamName) {
    try {
      // Find the team by name
      const team = Array.from(this.teams.values())
        .find(t => t.name === teamName);
      
      if (!team) {
        return false;
      }
      
      // Check if this team has an owner
      return Array.from(this.teamOwnerships.values())
        .some(o => o.teamId === team.id);
    } catch (error) {
      console.error('isTeamOwned error:', error);
      return false;
    }
  }
  
  async assignTeamToUser(teamId, userId) {
    try {
      // Check if this team is already owned
      const existingOwnership = Array.from(this.teamOwnerships.values())
        .find(o => o.teamId === teamId);
      
      if (existingOwnership) {
        // Update existing ownership
        existingOwnership.userId = userId;
        existingOwnership.assignedAt = new Date().toISOString();
        this.teamOwnerships.set(existingOwnership.id, existingOwnership);
        this.saveData();
        return existingOwnership;
      }
      
      // Create new ownership
      const id = this.teamOwnershipIdCounter++;
      const ownership = { 
        id,
        teamId,
        userId,
        assignedAt: new Date().toISOString()
      };
      
      this.teamOwnerships.set(id, ownership);
      this.saveData();
      return ownership;
    } catch (error) {
      console.error('assignTeamToUser error:', error);
      throw error;
    }
  }
  
  // User operations
  async getUserByDiscordId(discordId) {
    try {
      const user = Array.from(this.users.values())
        .find(u => u.discordId === discordId);
      return user;
    } catch (error) {
      console.error('getUserByDiscordId error:', error);
      return undefined;
    }
  }
  
  async getAllUsers() {
    try {
      return Array.from(this.users.values());
    } catch (error) {
      console.error('getAllUsers error:', error);
      return [];
    }
  }
  
  async createUser(insertUser) {
    try {
      const id = this.userIdCounter++;
      const user = { ...insertUser, id };
      this.users.set(id, user);
      this.saveData();
      return user;
    } catch (error) {
      console.error('createUser error:', error);
      throw error;
    }
  }
  
  async updateUser(id, userData) {
    try {
      const user = this.users.get(id);
      if (!user) {
        return undefined;
      }
      
      const updatedUser = { ...user, ...userData };
      this.users.set(id, updatedUser);
      this.saveData();
      return updatedUser;
    } catch (error) {
      console.error('updateUser error:', error);
      throw error;
    }
  }
  
  async updateUserStats(
    discordId, 
    fanSupportChange, 
    managementTrustChange, 
    teamMoraleChange
  ) {
    try {
      const user = await this.getUserByDiscordId(discordId);
      if (!user) {
        return undefined;
      }
      
      // Update stats with clamping to 0-100 range
      const updatedUser = { 
        ...user,
        fanSupport: Math.max(0, Math.min(100, (user.fanSupport || 50) + fanSupportChange)),
        managementTrust: Math.max(0, Math.min(100, (user.managementTrust || 50) + managementTrustChange)),
        teamMorale: Math.max(0, Math.min(100, (user.teamMorale || 50) + teamMoraleChange))
      };
      
      this.users.set(user.id, updatedUser);
      this.saveData();
      return updatedUser;
    } catch (error) {
      console.error('updateUserStats error:', error);
      throw error;
    }
  }
  
  async addUserTitle(discordId, title) {
    try {
      const user = await this.getUserByDiscordId(discordId);
      if (!user) {
        return undefined;
      }
      
      // Get current titles or initialize empty array
      const currentTitles = Array.isArray(user.titles) ? user.titles : [];
      
      // Add title if not already there
      if (!currentTitles.includes(title)) {
        const updatedTitles = [...currentTitles, title];
        const updatedUser = { ...user, titles: updatedTitles };
        this.users.set(user.id, updatedUser);
        this.saveData();
        return updatedUser;
      }
      
      return user;
    } catch (error) {
      console.error('addUserTitle error:', error);
      throw error;
    }
  }
  
  async addUserPoints(discordId, points) {
    try {
      const user = await this.getUserByDiscordId(discordId);
      if (!user) {
        return undefined;
      }
      
      // Check monthly point limit
      const canAddPoints = await this.checkMonthlyPointLimit(discordId, points);
      if (!canAddPoints) {
        return user; // Cannot add more points this month
      }
      
      // Current points or default to 0
      const currentPoints = user.points || 0;
      const currentMonthlyPoints = user.monthlyPoints || 0;
      
      // Update points
      const updatedUser = { 
        ...user,
        points: currentPoints + points,
        monthlyPoints: currentMonthlyPoints + points
      };
      
      this.users.set(user.id, updatedUser);
      this.saveData();
      return updatedUser;
    } catch (error) {
      console.error('addUserPoints error:', error);
      throw error;
    }
  }
  
  async checkCommandTimeout(discordId, commandName, timeoutMinutes, isAdmin = false) {
    try {
      // Admin users can bypass timeout
      if (isAdmin) {
        return true;
      }
      
      const user = await this.getUserByDiscordId(discordId);
      if (!user) {
        return false;
      }
      
      // Get last action time
      const lastActionTime = user.lastActionTime || {};
      const lastTime = lastActionTime[commandName];
      
      if (!lastTime) {
        // No previous usage, update and allow
        const now = new Date().toISOString();
        const updatedLastActionTime = { ...lastActionTime, [commandName]: now };
        await this.updateUser(user.id, { lastActionTime: updatedLastActionTime });
        return true;
      }
      
      // Calculate time difference
      const lastDate = new Date(lastTime);
      const now = new Date();
      const diffInMs = now.getTime() - lastDate.getTime();
      const diffInMinutes = diffInMs / (1000 * 60);
      
      if (diffInMinutes < timeoutMinutes) {
        // Not enough time has passed
        return false;
      }
      
      // Update last action time and allow
      const updatedLastActionTime = { ...lastActionTime, [commandName]: now.toISOString() };
      await this.updateUser(user.id, { lastActionTime: updatedLastActionTime });
      return true;
    } catch (error) {
      console.error('checkCommandTimeout error:', error);
      // In case of error, allow the command to prevent blocking users
      return true;
    }
  }
  
  async checkMonthlyPointLimit(discordId, pointsToAdd) {
    try {
      const user = await this.getUserByDiscordId(discordId);
      if (!user) {
        return false;
      }
      
      // Check if we need to reset monthly points
      const now = new Date();
      const currentMonth = now.getMonth() + '-' + now.getFullYear();
      
      if (user.lastPointReset !== currentMonth) {
        // New month, reset counter
        await this.updateUser(user.id, {
          monthlyPoints: 0,
          lastPointReset: currentMonth
        });
        return true;
      }
      
      // Check if adding these points would exceed the monthly limit
      const monthlyLimit = 1000; // 1000 points per month
      const currentMonthlyPoints = user.monthlyPoints || 0;
      
      if (currentMonthlyPoints + pointsToAdd > monthlyLimit) {
        return false; // Would exceed limit
      }
      
      return true;
    } catch (error) {
      console.error('checkMonthlyPointLimit error:', error);
      // In case of error, allow the points to prevent blocking users
      return true;
    }
  }
  
  // Team operations
  async getTeam(id) {
    try {
      return this.teams.get(id);
    } catch (error) {
      console.error('getTeam error:', error);
      return undefined;
    }
  }
  
  async getTeamByName(name) {
    try {
      return Array.from(this.teams.values())
        .find(t => t.name === name);
    } catch (error) {
      console.error('getTeamByName error:', error);
      return undefined;
    }
  }
  
  async getAllTeams() {
    try {
      return Array.from(this.teams.values());
    } catch (error) {
      console.error('getAllTeams error:', error);
      return [];
    }
  }
  
  async createTeam(insertTeam) {
    try {
      const id = this.teamIdCounter++;
      const team = { ...insertTeam, id };
      this.teams.set(id, team);
      this.saveData();
      return team;
    } catch (error) {
      console.error('createTeam error:', error);
      throw error;
    }
  }
  
  // Player operations
  async getPlayer(id) {
    try {
      return this.players.get(id);
    } catch (error) {
      console.error('getPlayer error:', error);
      return undefined;
    }
  }
  
  async getPlayersByTeamId(teamId) {
    try {
      return Array.from(this.players.values())
        .filter(p => p.teamId === teamId);
    } catch (error) {
      console.error('getPlayersByTeamId error:', error);
      return [];
    }
  }
  
  async createPlayer(insertPlayer) {
    try {
      const id = this.playerIdCounter++;
      const player = { ...insertPlayer, id };
      this.players.set(id, player);
      this.saveData();
      return player;
    } catch (error) {
      console.error('createPlayer error:', error);
      throw error;
    }
  }
  
  async updatePlayerMood(id, moodChange) {
    try {
      const player = this.players.get(id);
      if (!player) {
        return undefined;
      }
      
      // Update mood with clamping to 0-100 range
      const updatedMood = Math.max(0, Math.min(100, (player.mood || 50) + moodChange));
      const updatedPlayer = { ...player, mood: updatedMood };
      
      this.players.set(id, updatedPlayer);
      this.saveData();
      return updatedPlayer;
    } catch (error) {
      console.error('updatePlayerMood error:', error);
      throw error;
    }
  }
  
  async deletePlayer(id) {
    try {
      const result = this.players.delete(id);
      this.saveData();
      return result;
    } catch (error) {
      console.error('deletePlayer error:', error);
      throw error;
    }
  }
  
  // Game session operations
  async createGameSession(insertSession) {
    try {
      const id = this.gameSessionIdCounter++;
      const session = { ...insertSession, id };
      this.gameSessions.set(id, session);
      this.saveData();
      return session;
    } catch (error) {
      console.error('createGameSession error:', error);
      throw error;
    }
  }
  
  async getGameSession(id) {
    try {
      return this.gameSessions.get(id);
    } catch (error) {
      console.error('getGameSession error:', error);
      return undefined;
    }
  }
  
  async getAllGameSessions() {
    try {
      return Array.from(this.gameSessions.values());
    } catch (error) {
      console.error('getAllGameSessions error:', error);
      return [];
    }
  }
  
  async getActiveSessionByUserId(userId, sessionType) {
    try {
      return Array.from(this.gameSessions.values())
        .find(s => s.userId === userId && s.sessionType === sessionType && s.isActive === true);
    } catch (error) {
      console.error('getActiveSessionByUserId error:', error);
      return undefined;
    }
  }
  
  async updateGameSession(id, sessionData) {
    try {
      const session = this.gameSessions.get(id);
      if (!session) {
        return undefined;
      }
      
      // Merge session data
      const updatedSessionData = {
        ...session.sessionData,
        ...sessionData
      };
      
      const updatedSession = {
        ...session,
        sessionData: updatedSessionData
      };
      
      this.gameSessions.set(id, updatedSession);
      this.saveData();
      return updatedSession;
    } catch (error) {
      console.error('updateGameSession error:', error);
      throw error;
    }
  }
  
  async endGameSession(id) {
    try {
      const session = this.gameSessions.get(id);
      if (!session) {
        return false;
      }
      
      const updatedSession = {
        ...session,
        isActive: false
      };
      
      this.gameSessions.set(id, updatedSession);
      this.saveData();
      return true;
    } catch (error) {
      console.error('endGameSession error:', error);
      throw error;
    }
  }
  
  // Initialize default teams
  initializeDefaultTeams() {
    const defaultTeams = [
      { name: '🦅 Beşiktaş', traitType: 'çalkantılı' },
      { name: '🦁 Galatasaray', traitType: 'sansasyonel' },
      { name: '💛 Fenerbahçe', traitType: 'sansasyonel' },
      { name: '💜 Trabzonspor', traitType: 'çalkantılı' },
      { name: '🔴 Manchester United', traitType: 'sansasyonel' },
      { name: '🔵 Manchester City', traitType: 'kurumsal' },
      { name: '⚪ Real Madrid', traitType: 'kurumsal' },
      { name: '🔴 Barcelona', traitType: 'kurumsal' },
      { name: '⚪ Bayern Munich', traitType: 'kurumsal' },
      { name: '⚫ Juventus', traitType: 'kurumsal' },
      { name: '🔴 Liverpool', traitType: 'kurumsal' },
      { name: '🔵 Chelsea', traitType: 'çalkantılı' },
      { name: '⚪ Tottenham', traitType: 'çalkantılı' },
      { name: '🔴 Arsenal', traitType: 'kurumsal' },
      { name: '🔵 PSG', traitType: 'sansasyonel' },
      { name: '⚫ AC Milan', traitType: 'çalkantılı' },
      { name: '🔵 Inter', traitType: 'çalkantılı' },
      { name: '🟡 Borussia Dortmund', traitType: 'çalkantılı' },
      { name: '⚪ Ajax', traitType: 'kurumsal' },
      { name: '🔴 Atletico Madrid', traitType: 'çalkantılı' }
    ];
    
    defaultTeams.forEach(async (team) => {
      await this.createTeam(team);
    });
    
    console.log(`${defaultTeams.length} takım başarıyla oluşturuldu.`);
  }
}

// Create storage instance
export const storage = new MemStorage();