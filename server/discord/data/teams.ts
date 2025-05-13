import { Team, Player, InsertPlayer } from '@shared/schema';
import { storage } from '../../storage';

// Her takım için varsayılan oyuncuları oluştur
// Bu fonksiyon, takımlar oluşturulduktan sonra çağrılmalıdır
export async function initializeTeamPlayers(): Promise<void> {
  try {
    console.log('Takım oyuncuları oluşturuluyor...');
    
    // Tüm takımları getir
    const teams = await storage.getAllTeams();
    
    // Her takım için oyuncuları oluştur
    for (const team of teams) {
      const players = getPlayersForTeam(team.name);
      
      // Bu takımın mevcut oyuncularını kontrol et
      const existingPlayers = await storage.getPlayersByTeamId(team.id);
      
      // Eğer bu takımın oyuncuları zaten varsa, yenilerini ekleme
      if (existingPlayers.length > 0) {
        console.log(`${team.name} takımının oyuncuları zaten var, atlanıyor.`);
        continue;
      }
      
      // Oyuncuları ekle
      for (const player of players) {
        try {
          await storage.createPlayer({
            name: player.name,
            position: player.position,
            jerseyNumber: player.jerseyNumber,
            teamId: team.id,
            mood: 70 // Varsayılan olarak iyi moral
          });
        } catch (err) {
          console.error(`${player.name} oyuncusu eklenirken hata oluştu:`, err);
        }
      }
      
      console.log(`${team.name} takımına ${players.length} oyuncu eklendi.`);
    }
    
    console.log('Takım oyuncuları başarıyla oluşturuldu!');
  } catch (error) {
    console.error('Takım oyuncularını oluştururken hata:', error);
  }
}

// Her takım için oyuncuları döndür
function getPlayersForTeam(teamName: string): { name: string; position: string; jerseyNumber: number }[] {
  // Takıma özgü oyuncuları seç
  switch (teamName) {
    case 'Arsenal':
      return [
        { name: 'David Raya', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'William Saliba', position: 'Defans', jerseyNumber: 2 },
        { name: 'Ben White', position: 'Defans', jerseyNumber: 4 },
        { name: 'Gabriel Magalhães', position: 'Defans', jerseyNumber: 6 },
        { name: 'Jurrien Timber', position: 'Defans', jerseyNumber: 12 },
        { name: 'Declan Rice', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Martin Ødegaard', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Thomas Partey', position: 'Orta Saha', jerseyNumber: 5 },
        { name: 'Bukayo Saka', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Mikel Merino', position: 'Orta Saha', jerseyNumber: 23 },
        { name: 'Kai Havertz', position: 'Forvet', jerseyNumber: 29 },
        { name: 'Gabriel Jesus', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Leandro Trossard', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Gabriel Martinelli', position: 'Forvet', jerseyNumber: 11 }
      ];
      
    case 'Aston Villa':
      return [
        { name: 'Emiliano Martinez', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Matty Cash', position: 'Defans', jerseyNumber: 2 },
        { name: 'Ezri Konsa', position: 'Defans', jerseyNumber: 4 },
        { name: 'Pau Torres', position: 'Defans', jerseyNumber: 5 },
        { name: 'Lucas Digne', position: 'Defans', jerseyNumber: 12 },
        { name: 'Boubacar Kamara', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Douglas Luiz', position: 'Orta Saha', jerseyNumber: 6 },
        { name: 'John McGinn', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Youri Tielemans', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Amadou Onana', position: 'Orta Saha', jerseyNumber: 18 },
        { name: 'Ollie Watkins', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Moussa Diaby', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Jacob Ramsey', position: 'Forvet', jerseyNumber: 41 },
        { name: 'Jhon Durán', position: 'Forvet', jerseyNumber: 24 }
      ];
      
    case 'Chelsea':
      return [
        { name: 'Robert Sánchez', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Reece James', position: 'Defans', jerseyNumber: 24 },
        { name: 'Wesley Fofana', position: 'Defans', jerseyNumber: 33 },
        { name: 'Levi Colwill', position: 'Defans', jerseyNumber: 26 },
        { name: 'Marc Cucurella', position: 'Defans', jerseyNumber: 3 },
        { name: 'Enzo Fernández', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Moisés Caicedo', position: 'Orta Saha', jerseyNumber: 25 },
        { name: 'Cole Palmer', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Noni Madueke', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'Romeo Lavia', position: 'Orta Saha', jerseyNumber: 45 },
        { name: 'Christopher Nkunku', position: 'Forvet', jerseyNumber: 18 },
        { name: 'Mykhailo Mudryk', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Nicolas Jackson', position: 'Forvet', jerseyNumber: 15 },
        { name: 'Pedro Neto', position: 'Forvet', jerseyNumber: 7 }
      ];
      
    case 'Liverpool':
      return [
        { name: 'Alisson Becker', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Trent Alexander-Arnold', position: 'Defans', jerseyNumber: 66 },
        { name: 'Ibrahima Konaté', position: 'Defans', jerseyNumber: 5 },
        { name: 'Virgil van Dijk', position: 'Defans', jerseyNumber: 4 },
        { name: 'Andrew Robertson', position: 'Defans', jerseyNumber: 26 },
        { name: 'Ryan Gravenberch', position: 'Orta Saha', jerseyNumber: 38 },
        { name: 'Alexis Mac Allister', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Dominik Szoboszlai', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Federico Chiesa', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Curtis Jones', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Mohamed Salah', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Luis Díaz', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Diogo Jota', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Darwin Núñez', position: 'Forvet', jerseyNumber: 9 }
      ];
      
    case 'Manchester City':
      return [
        { name: 'Ederson', position: 'Kaleci', jerseyNumber: 31 },
        { name: 'Kyle Walker', position: 'Defans', jerseyNumber: 2 },
        { name: 'Rúben Dias', position: 'Defans', jerseyNumber: 3 },
        { name: 'Nathan Aké', position: 'Defans', jerseyNumber: 6 },
        { name: 'Joško Gvardiol', position: 'Defans', jerseyNumber: 24 },
        { name: 'Rodri', position: 'Orta Saha', jerseyNumber: 16 },
        { name: 'Kevin De Bruyne', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Bernardo Silva', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Phil Foden', position: 'Orta Saha', jerseyNumber: 47 },
        { name: 'Matheus Nunes', position: 'Orta Saha', jerseyNumber: 27 },
        { name: 'Erling Haaland', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Jack Grealish', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Jérémy Doku', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Julián Álvarez', position: 'Forvet', jerseyNumber: 19 }
      ];
      
    case 'Manchester United':
      return [
        { name: 'André Onana', position: 'Kaleci', jerseyNumber: 24 },
        { name: 'Diogo Dalot', position: 'Defans', jerseyNumber: 20 },
        { name: 'Matthijs de Ligt', position: 'Defans', jerseyNumber: 4 },
        { name: 'Lisandro Martínez', position: 'Defans', jerseyNumber: 6 },
        { name: 'Luke Shaw', position: 'Defans', jerseyNumber: 23 },
        { name: 'Casemiro', position: 'Orta Saha', jerseyNumber: 18 },
        { name: 'Bruno Fernandes', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Mason Mount', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Kobbie Mainoo', position: 'Orta Saha', jerseyNumber: 37 },
        { name: 'Manuel Ugarte', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Marcus Rashford', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Rasmus Højlund', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Antony', position: 'Forvet', jerseyNumber: 21 },
        { name: 'Alejandro Garnacho', position: 'Forvet', jerseyNumber: 17 }
      ];
      
    case 'Tottenham':
      return [
        { name: 'Guglielmo Vicario', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Pedro Porro', position: 'Defans', jerseyNumber: 23 },
        { name: 'Cristian Romero', position: 'Defans', jerseyNumber: 17 },
        { name: 'Micky van de Ven', position: 'Defans', jerseyNumber: 37 },
        { name: 'Destiny Udogie', position: 'Defans', jerseyNumber: 38 },
        { name: 'Yves Bissouma', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'James Maddison', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Pape Matar Sarr', position: 'Orta Saha', jerseyNumber: 29 },
        { name: 'Rodrigo Bentancur', position: 'Orta Saha', jerseyNumber: 30 },
        { name: 'Dejan Kulusevski', position: 'Orta Saha', jerseyNumber: 21 },
        { name: 'Son Heung-min', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Richarlison', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Brennan Johnson', position: 'Forvet', jerseyNumber: 22 },
        { name: 'Dominic Solanke', position: 'Forvet', jerseyNumber: 9 }
      ];
      
    case 'Newcastle':
      return [
        { name: 'Nick Pope', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Kieran Trippier', position: 'Defans', jerseyNumber: 2 },
        { name: 'Fabian Schär', position: 'Defans', jerseyNumber: 5 },
        { name: 'Sven Botman', position: 'Defans', jerseyNumber: 4 },
        { name: 'Dan Burn', position: 'Defans', jerseyNumber: 33 },
        { name: 'Bruno Guimarães', position: 'Orta Saha', jerseyNumber: 39 },
        { name: 'Joelinton', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Joe Willock', position: 'Orta Saha', jerseyNumber: 28 },
        { name: 'Sean Longstaff', position: 'Orta Saha', jerseyNumber: 36 },
        { name: 'Sandro Tonali', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Anthony Gordon', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Callum Wilson', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Alexander Isak', position: 'Forvet', jerseyNumber: 14 },
        { name: 'Harvey Barnes', position: 'Forvet', jerseyNumber: 15 }
      ];
      
    case 'Brighton':
      return [
        { name: 'Jason Steele', position: 'Kaleci', jerseyNumber: 23 },
        { name: 'Tariq Lamptey', position: 'Defans', jerseyNumber: 2 },
        { name: 'Lewis Dunk', position: 'Defans', jerseyNumber: 5 },
        { name: 'Jan Paul van Hecke', position: 'Defans', jerseyNumber: 29 },
        { name: 'Pervis Estupiñán', position: 'Defans', jerseyNumber: 30 },
        { name: 'Pascal Groß', position: 'Orta Saha', jerseyNumber: 13 },
        { name: 'Billy Gilmour', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'James Milner', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Kaoru Mitoma', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Simon Adingra', position: 'Orta Saha', jerseyNumber: 24 },
        { name: 'Evan Ferguson', position: 'Forvet', jerseyNumber: 28 },
        { name: 'Danny Welbeck', position: 'Forvet', jerseyNumber: 18 },
        { name: 'João Pedro', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Julio Enciso', position: 'Forvet', jerseyNumber: 20 }
      ];
    
    // Diğer takımlar için kendi oyuncularını ekleyebilirsiniz
    // Daha fazla takım eklemek için case'ler eklemeye devam edin
      
    default:
      // Eğer takım listede yoksa, boş array döndür
      console.log(`${teamName} için oyuncu listesi tanımlanmamış.`);
      return [];
  }
}