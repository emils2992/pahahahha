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
  // Takıma özgü oyuncuları seç - 2025/26 Sezonu
  switch (teamName) {
    case 'Arsenal':
      return [
        { name: 'David Raya', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'William Saliba', position: 'Defans', jerseyNumber: 2 },
        { name: 'Ben White', position: 'Defans', jerseyNumber: 4 },
        { name: 'Gabriel Magalhães', position: 'Defans', jerseyNumber: 6 },
        { name: 'Jurrien Timber', position: 'Defans', jerseyNumber: 12 },
        { name: 'Riccardo Calafiori', position: 'Defans', jerseyNumber: 33 },
        { name: 'Takehiro Tomiyasu', position: 'Defans', jerseyNumber: 18 },
        { name: 'Declan Rice', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Martin Ødegaard', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Thomas Partey', position: 'Orta Saha', jerseyNumber: 5 },
        { name: 'Bukayo Saka', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Mikel Merino', position: 'Orta Saha', jerseyNumber: 23 },
        { name: 'Jorginho', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Fabio Vieira', position: 'Orta Saha', jerseyNumber: 21 },
        { name: 'Kai Havertz', position: 'Forvet', jerseyNumber: 29 },
        { name: 'Gabriel Jesus', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Leandro Trossard', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Gabriel Martinelli', position: 'Forvet', jerseyNumber: 11 }
      ];
      
    case 'Aston Villa':
      return [
        { name: 'Emiliano Martinez', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Robin Olsen', position: 'Kaleci', jerseyNumber: 25 },
        { name: 'Matty Cash', position: 'Defans', jerseyNumber: 2 },
        { name: 'Ezri Konsa', position: 'Defans', jerseyNumber: 4 },
        { name: 'Pau Torres', position: 'Defans', jerseyNumber: 5 },
        { name: 'Lucas Digne', position: 'Defans', jerseyNumber: 12 },
        { name: 'Diego Carlos', position: 'Defans', jerseyNumber: 3 },
        { name: 'Boubacar Kamara', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'John McGinn', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Youri Tielemans', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Amadou Onana', position: 'Orta Saha', jerseyNumber: 18 },
        { name: 'Ross Barkley', position: 'Orta Saha', jerseyNumber: 6 },
        { name: 'Enzo Barrenechea', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Jacob Ramsey', position: 'Orta Saha', jerseyNumber: 41 },
        { name: 'Ollie Watkins', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Jhon Durán', position: 'Forvet', jerseyNumber: 24 },
        { name: 'Morgan Rogers', position: 'Forvet', jerseyNumber: 27 },
        { name: 'Samuel Omorodion', position: 'Forvet', jerseyNumber: 19 }
      ];
      
    case 'Bournemouth':
      return [
        { name: 'Neto', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Mark Travers', position: 'Kaleci', jerseyNumber: 42 },
        { name: 'Adam Smith', position: 'Defans', jerseyNumber: 2 },
        { name: 'Illia Zabarnyi', position: 'Defans', jerseyNumber: 24 },
        { name: 'Marcos Senesi', position: 'Defans', jerseyNumber: 25 },
        { name: 'Milos Kerkez', position: 'Defans', jerseyNumber: 3 },
        { name: 'Max Aarons', position: 'Defans', jerseyNumber: 37 },
        { name: 'Kepa Arrizabalaga', position: 'Defans', jerseyNumber: 26 },
        { name: 'Ryan Christie', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Lewis Cook', position: 'Orta Saha', jerseyNumber: 4 },
        { name: 'Tyler Adams', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Philip Billing', position: 'Orta Saha', jerseyNumber: 29 },
        { name: 'Marcus Tavernier', position: 'Orta Saha', jerseyNumber: 16 },
        { name: 'Justin Kluivert', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Antoine Semenyo', position: 'Forvet', jerseyNumber: 24 },
        { name: 'Dominic Solanke', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Evanilson', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Luis Sinisterra', position: 'Forvet', jerseyNumber: 11 }
      ];
      
    case 'Brentford':
      return [
        { name: 'Mark Flekken', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Thomas Strakosha', position: 'Kaleci', jerseyNumber: 22 },
        { name: 'Ethan Pinnock', position: 'Defans', jerseyNumber: 5 },
        { name: 'Nathan Collins', position: 'Defans', jerseyNumber: 22 },
        { name: 'Ben Mee', position: 'Defans', jerseyNumber: 16 },
        { name: 'Rico Henry', position: 'Defans', jerseyNumber: 3 },
        { name: 'Aaron Hickey', position: 'Defans', jerseyNumber: 2 },
        { name: 'Sergio Reguilón', position: 'Defans', jerseyNumber: 18 },
        { name: 'Vitaly Janelt', position: 'Orta Saha', jerseyNumber: 27 },
        { name: 'Christian Nørgaard', position: 'Orta Saha', jerseyNumber: 6 },
        { name: 'Mikkel Damsgaard', position: 'Orta Saha', jerseyNumber: 24 },
        { name: 'Josh Dasilva', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Mathias Jensen', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Kevin Schade', position: 'Orta Saha', jerseyNumber: 9 },
        { name: 'Bryan Mbeumo', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Yoane Wissa', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Ivan Toney', position: 'Forvet', jerseyNumber: 17 },
        { name: 'Igor Thiago', position: 'Forvet', jerseyNumber: 9 }
      ];
      
    case 'Brighton':
      return [
        { name: 'Bart Verbruggen', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Jason Steele', position: 'Kaleci', jerseyNumber: 23 },
        { name: 'Tariq Lamptey', position: 'Defans', jerseyNumber: 2 },
        { name: 'Lewis Dunk', position: 'Defans', jerseyNumber: 5 },
        { name: 'Jan Paul van Hecke', position: 'Defans', jerseyNumber: 29 },
        { name: 'Pervis Estupiñán', position: 'Defans', jerseyNumber: 30 },
        { name: 'Igor Julio', position: 'Defans', jerseyNumber: 14 },
        { name: 'Joel Veltman', position: 'Defans', jerseyNumber: 34 },
        { name: 'Pascal Groß', position: 'Orta Saha', jerseyNumber: 13 },
        { name: 'Billy Gilmour', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'James Milner', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Kaoru Mitoma', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Simon Adingra', position: 'Orta Saha', jerseyNumber: 24 },
        { name: 'Solly March', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Evan Ferguson', position: 'Forvet', jerseyNumber: 28 },
        { name: 'Danny Welbeck', position: 'Forvet', jerseyNumber: 18 },
        { name: 'João Pedro', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Julio Enciso', position: 'Forvet', jerseyNumber: 20 }
      ];
      
    case 'Chelsea':
      return [
        { name: 'Robert Sánchez', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Filip Jörgensen', position: 'Kaleci', jerseyNumber: 28 },
        { name: 'Reece James', position: 'Defans', jerseyNumber: 24 },
        { name: 'Wesley Fofana', position: 'Defans', jerseyNumber: 33 },
        { name: 'Levi Colwill', position: 'Defans', jerseyNumber: 26 },
        { name: 'Marc Cucurella', position: 'Defans', jerseyNumber: 3 },
        { name: 'Malo Gusto', position: 'Defans', jerseyNumber: 27 },
        { name: 'Benoît Badiashile', position: 'Defans', jerseyNumber: 5 },
        { name: 'Enzo Fernández', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Moisés Caicedo', position: 'Orta Saha', jerseyNumber: 25 },
        { name: 'Cole Palmer', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Noni Madueke', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'Romeo Lavia', position: 'Orta Saha', jerseyNumber: 45 },
        { name: 'Carney Chukwuemeka', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Christopher Nkunku', position: 'Forvet', jerseyNumber: 18 },
        { name: 'Mykhailo Mudryk', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Nicolas Jackson', position: 'Forvet', jerseyNumber: 15 },
        { name: 'Pedro Neto', position: 'Forvet', jerseyNumber: 7 }
      ];
      
    case 'Crystal Palace':
      return [
        { name: 'Dean Henderson', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Sam Johnstone', position: 'Kaleci', jerseyNumber: 13 },
        { name: 'Marc Guéhi', position: 'Defans', jerseyNumber: 6 },
        { name: 'Joachim Andersen', position: 'Defans', jerseyNumber: 16 },
        { name: 'Tyrick Mitchell', position: 'Defans', jerseyNumber: 3 },
        { name: 'Nathaniel Clyne', position: 'Defans', jerseyNumber: 17 },
        { name: 'Chris Richards', position: 'Defans', jerseyNumber: 26 },
        { name: 'Daniel Muñoz', position: 'Defans', jerseyNumber: 29 },
        { name: 'Eberechi Eze', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Michael Olise', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Jefferson Lerma', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Adam Wharton', position: 'Orta Saha', jerseyNumber: 26 },
        { name: 'Will Hughes', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Jeffrey Schlupp', position: 'Orta Saha', jerseyNumber: 15 },
        { name: 'Jean-Philippe Mateta', position: 'Forvet', jerseyNumber: 14 },
        { name: 'Eddie Nketiah', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Odsonne Édouard', position: 'Forvet', jerseyNumber: 22 },
        { name: 'Ismaïla Sarr', position: 'Forvet', jerseyNumber: 10 }
      ];
      
    case 'Everton':
      return [
        { name: 'Jordan Pickford', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'João Virgínia', position: 'Kaleci', jerseyNumber: 31 },
        { name: 'James Tarkowski', position: 'Defans', jerseyNumber: 2 },
        { name: 'Michael Keane', position: 'Defans', jerseyNumber: 5 },
        { name: 'Jarrad Branthwaite', position: 'Defans', jerseyNumber: 32 },
        { name: 'Vitaliy Mykolenko', position: 'Defans', jerseyNumber: 19 },
        { name: 'Ashley Young', position: 'Defans', jerseyNumber: 18 },
        { name: 'Nathan Patterson', position: 'Defans', jerseyNumber: 3 },
        { name: 'Amadou Onana', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Idrissa Gueye', position: 'Orta Saha', jerseyNumber: 27 },
        { name: 'Abdoulaye Doucouré', position: 'Orta Saha', jerseyNumber: 16 },
        { name: 'James Garner', position: 'Orta Saha', jerseyNumber: 37 },
        { name: 'Tim Iroegbunam', position: 'Orta Saha', jerseyNumber: 28 },
        { name: 'Jack Harrison', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'Dominic Calvert-Lewin', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Beto', position: 'Forvet', jerseyNumber: 14 },
        { name: 'Neal Maupay', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Iliman Ndiaye', position: 'Forvet', jerseyNumber: 10 }
      ];

    case 'Fulham':
      return [
        { name: 'Bernd Leno', position: 'Kaleci', jerseyNumber: 17 },
        { name: 'Marek Rodák', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Kenny Tete', position: 'Defans', jerseyNumber: 2 },
        { name: 'Tosin Adarabioyo', position: 'Defans', jerseyNumber: 16 },
        { name: 'Calvin Bassey', position: 'Defans', jerseyNumber: 3 },
        { name: 'Antonee Robinson', position: 'Defans', jerseyNumber: 33 },
        { name: 'Issa Diop', position: 'Defans', jerseyNumber: 31 },
        { name: 'Joachim Andersen', position: 'Defans', jerseyNumber: 4 },
        { name: 'João Palhinha', position: 'Orta Saha', jerseyNumber: 26 },
        { name: 'Harrison Reed', position: 'Orta Saha', jerseyNumber: 6 },
        { name: 'Andreas Pereira', position: 'Orta Saha', jerseyNumber: 18 },
        { name: 'Alex Iwobi', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Tom Cairney', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Harry Wilson', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Rodrigo Muniz', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Raúl Jiménez', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Emile Smith Rowe', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Adama Traoré', position: 'Forvet', jerseyNumber: 37 }
      ];
      
    case 'Ipswich Town':
      return [
        { name: 'Vaclav Hladky', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Christian Walton', position: 'Kaleci', jerseyNumber: 28 },
        { name: 'Harry Clarke', position: 'Defans', jerseyNumber: 2 },
        { name: 'Cameron Burgess', position: 'Defans', jerseyNumber: 26 },
        { name: 'Luke Woolfenden', position: 'Defans', jerseyNumber: 6 },
        { name: 'Leif Davis', position: 'Defans', jerseyNumber: 3 },
        { name: 'Axel Tuanzebe', position: 'Defans', jerseyNumber: 4 },
        { name: 'Jacob Greaves', position: 'Defans', jerseyNumber: 5 },
        { name: 'Sam Morsy', position: 'Orta Saha', jerseyNumber: 55 },
        { name: 'Massimo Luongo', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Conor Chaplin', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Wes Burns', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Jack Taylor', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Omari Hutchinson', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Nathan Broadhead', position: 'Forvet', jerseyNumber: 17 },
        { name: 'George Hirst', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Liam Delap', position: 'Forvet', jerseyNumber: 19 },
        { name: 'Kieffer Moore', position: 'Forvet', jerseyNumber: 11 }
      ];
      
    case 'Leicester City':
      return [
        { name: 'Mads Hermansen', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Jakub Stolarczyk', position: 'Kaleci', jerseyNumber: 25 },
        { name: 'Ricardo Pereira', position: 'Defans', jerseyNumber: 2 },
        { name: 'Wout Faes', position: 'Defans', jerseyNumber: 3 },
        { name: 'Jannik Vestergaard', position: 'Defans', jerseyNumber: 4 },
        { name: 'James Justin', position: 'Defans', jerseyNumber: 2 },
        { name: 'Victor Kristiansen', position: 'Defans', jerseyNumber: 17 },
        { name: 'Caleb Okoli', position: 'Defans', jerseyNumber: 35 },
        { name: 'Harry Winks', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Wilfred Ndidi', position: 'Orta Saha', jerseyNumber: 25 },
        { name: 'Kiernan Dewsbury-Hall', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Abdul Fatawu', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Stephy Mavididi', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'Facundo Buonanotte', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Jamie Vardy', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Patson Daka', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Bilal El Khannouss', position: 'Forvet', jerseyNumber: 17 },
        { name: 'Tom Cannon', position: 'Forvet', jerseyNumber: 19 }
      ];

    case 'Liverpool':
      return [
        { name: 'Alisson Becker', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Caoimhin Kelleher', position: 'Kaleci', jerseyNumber: 62 },
        { name: 'Trent Alexander-Arnold', position: 'Defans', jerseyNumber: 66 },
        { name: 'Ibrahima Konaté', position: 'Defans', jerseyNumber: 5 },
        { name: 'Virgil van Dijk', position: 'Defans', jerseyNumber: 4 },
        { name: 'Andrew Robertson', position: 'Defans', jerseyNumber: 26 },
        { name: 'Kostas Tsimikas', position: 'Defans', jerseyNumber: 21 },
        { name: 'Jarell Quansah', position: 'Defans', jerseyNumber: 78 },
        { name: 'Ryan Gravenberch', position: 'Orta Saha', jerseyNumber: 38 },
        { name: 'Alexis Mac Allister', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Dominik Szoboszlai', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Federico Chiesa', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Curtis Jones', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Harvey Elliott', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Mohamed Salah', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Luis Díaz', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Diogo Jota', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Darwin Núñez', position: 'Forvet', jerseyNumber: 9 }
      ];
      
    case 'Manchester City':
      return [
        { name: 'Ederson', position: 'Kaleci', jerseyNumber: 31 },
        { name: 'Stefan Ortega', position: 'Kaleci', jerseyNumber: 18 },
        { name: 'Kyle Walker', position: 'Defans', jerseyNumber: 2 },
        { name: 'Rúben Dias', position: 'Defans', jerseyNumber: 3 },
        { name: 'Nathan Aké', position: 'Defans', jerseyNumber: 6 },
        { name: 'Joško Gvardiol', position: 'Defans', jerseyNumber: 24 },
        { name: 'John Stones', position: 'Defans', jerseyNumber: 5 },
        { name: 'Manuel Akanji', position: 'Defans', jerseyNumber: 25 },
        { name: 'Rodri', position: 'Orta Saha', jerseyNumber: 16 },
        { name: 'Kevin De Bruyne', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Bernardo Silva', position: 'Orta Saha', jerseyNumber: 20 },
        { name: 'Phil Foden', position: 'Orta Saha', jerseyNumber: 47 },
        { name: 'Matheus Nunes', position: 'Orta Saha', jerseyNumber: 27 },
        { name: 'İlkay Gündoğan', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Erling Haaland', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Jack Grealish', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Jérémy Doku', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Savinho', position: 'Forvet', jerseyNumber: 27 }
      ];
      
    case 'Manchester United':
      return [
        { name: 'André Onana', position: 'Kaleci', jerseyNumber: 24 },
        { name: 'Altay Bayındır', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Diogo Dalot', position: 'Defans', jerseyNumber: 20 },
        { name: 'Matthijs de Ligt', position: 'Defans', jerseyNumber: 4 },
        { name: 'Lisandro Martínez', position: 'Defans', jerseyNumber: 6 },
        { name: 'Luke Shaw', position: 'Defans', jerseyNumber: 23 },
        { name: 'Harry Maguire', position: 'Defans', jerseyNumber: 5 },
        { name: 'Noussair Mazraoui', position: 'Defans', jerseyNumber: 3 },
        { name: 'Casemiro', position: 'Orta Saha', jerseyNumber: 18 },
        { name: 'Bruno Fernandes', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Mason Mount', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Kobbie Mainoo', position: 'Orta Saha', jerseyNumber: 37 },
        { name: 'Manuel Ugarte', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Christian Eriksen', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Marcus Rashford', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Rasmus Højlund', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Antony', position: 'Forvet', jerseyNumber: 21 },
        { name: 'Alejandro Garnacho', position: 'Forvet', jerseyNumber: 17 }
      ];
      
    case 'Newcastle':
      return [
        { name: 'Nick Pope', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Martin Dúbravka', position: 'Kaleci', jerseyNumber: 22 },
        { name: 'Kieran Trippier', position: 'Defans', jerseyNumber: 2 },
        { name: 'Fabian Schär', position: 'Defans', jerseyNumber: 5 },
        { name: 'Sven Botman', position: 'Defans', jerseyNumber: 4 },
        { name: 'Dan Burn', position: 'Defans', jerseyNumber: 33 },
        { name: 'Emil Krafth', position: 'Defans', jerseyNumber: 17 },
        { name: 'Lloyd Kelly', position: 'Defans', jerseyNumber: 15 },
        { name: 'Bruno Guimarães', position: 'Orta Saha', jerseyNumber: 39 },
        { name: 'Joelinton', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Joe Willock', position: 'Orta Saha', jerseyNumber: 28 },
        { name: 'Sean Longstaff', position: 'Orta Saha', jerseyNumber: 36 },
        { name: 'Sandro Tonali', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Jacob Murphy', position: 'Orta Saha', jerseyNumber: 23 },
        { name: 'Anthony Gordon', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Callum Wilson', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Alexander Isak', position: 'Forvet', jerseyNumber: 14 },
        { name: 'Harvey Barnes', position: 'Forvet', jerseyNumber: 15 }
      ];
      
    case 'Nottingham Forest':
      return [
        { name: 'Matz Sels', position: 'Kaleci', jerseyNumber: 13 },
        { name: 'Matt Turner', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Neco Williams', position: 'Defans', jerseyNumber: 7 },
        { name: 'Willy Boly', position: 'Defans', jerseyNumber: 30 },
        { name: 'Murillo', position: 'Defans', jerseyNumber: 16 },
        { name: 'Ola Aina', position: 'Defans', jerseyNumber: 33 },
        { name: 'Andrew Omobamidele', position: 'Defans', jerseyNumber: 14 },
        { name: 'Nikola Milenković', position: 'Defans', jerseyNumber: 4 },
        { name: 'Danilo', position: 'Orta Saha', jerseyNumber: 28 },
        { name: 'Ryan Yates', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Morgan Gibbs-White', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Nicolas Domínguez', position: 'Orta Saha', jerseyNumber: 6 },
        { name: 'Ibrahim Sangaré', position: 'Orta Saha', jerseyNumber: 29 },
        { name: 'Anthony Elanga', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Taiwo Awoniyi', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Chris Wood', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Jota Silva', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Callum Hudson-Odoi', position: 'Forvet', jerseyNumber: 14 }
      ];
      
    case 'Southampton':
      return [
        { name: 'Alex McCarthy', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Aaron Ramsdale', position: 'Kaleci', jerseyNumber: 12 },
        { name: 'Kyle Walker-Peters', position: 'Defans', jerseyNumber: 2 },
        { name: 'Jan Bednarek', position: 'Defans', jerseyNumber: 6 },
        { name: 'Taylor Harwood-Bellis', position: 'Defans', jerseyNumber: 16 },
        { name: 'Ryan Manning', position: 'Defans', jerseyNumber: 3 },
        { name: 'James Bree', position: 'Defans', jerseyNumber: 41 },
        { name: 'Jack Stephens', position: 'Defans', jerseyNumber: 5 },
        { name: 'Flynn Downes', position: 'Orta Saha', jerseyNumber: 12 },
        { name: 'Shea Charles', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Joe Aribo', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Will Smallbone', position: 'Orta Saha', jerseyNumber: 26 },
        { name: 'Cameron Archer', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Stuart Armstrong', position: 'Orta Saha', jerseyNumber: 17 },
        { name: 'Adam Armstrong', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Paul Onuachu', position: 'Forvet', jerseyNumber: 21 },
        { name: 'Sékou Mara', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Matěj Vydra', position: 'Forvet', jerseyNumber: 20 }
      ];
      
    case 'Tottenham':
      return [
        { name: 'Guglielmo Vicario', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Fraser Forster', position: 'Kaleci', jerseyNumber: 20 },
        { name: 'Pedro Porro', position: 'Defans', jerseyNumber: 23 },
        { name: 'Cristian Romero', position: 'Defans', jerseyNumber: 17 },
        { name: 'Micky van de Ven', position: 'Defans', jerseyNumber: 37 },
        { name: 'Destiny Udogie', position: 'Defans', jerseyNumber: 38 },
        { name: 'Ben Davies', position: 'Defans', jerseyNumber: 33 },
        { name: 'Radu Drăgușin', position: 'Defans', jerseyNumber: 15 },
        { name: 'Yves Bissouma', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'James Maddison', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'Pape Matar Sarr', position: 'Orta Saha', jerseyNumber: 29 },
        { name: 'Rodrigo Bentancur', position: 'Orta Saha', jerseyNumber: 30 },
        { name: 'Dejan Kulusevski', position: 'Orta Saha', jerseyNumber: 21 },
        { name: 'Lucas Bergvall', position: 'Orta Saha', jerseyNumber: 16 },
        { name: 'Son Heung-min', position: 'Forvet', jerseyNumber: 7 },
        { name: 'Richarlison', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Brennan Johnson', position: 'Forvet', jerseyNumber: 22 },
        { name: 'Dominic Solanke', position: 'Forvet', jerseyNumber: 9 }
      ];
      
    case 'West Ham':
      return [
        { name: 'Alphonse Areola', position: 'Kaleci', jerseyNumber: 23 },
        { name: 'Łukasz Fabiański', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Vladimír Coufal', position: 'Defans', jerseyNumber: 5 },
        { name: 'Kurt Zouma', position: 'Defans', jerseyNumber: 4 },
        { name: 'Nayef Aguerd', position: 'Defans', jerseyNumber: 27 },
        { name: 'Emerson Palmieri', position: 'Defans', jerseyNumber: 33 },
        { name: 'Aaron Cresswell', position: 'Defans', jerseyNumber: 3 },
        { name: 'Max Kilman', position: 'Defans', jerseyNumber: 15 },
        { name: 'Tomáš Souček', position: 'Orta Saha', jerseyNumber: 28 },
        { name: 'Edson Álvarez', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Lucas Paquetá', position: 'Orta Saha', jerseyNumber: 10 },
        { name: 'James Ward-Prowse', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Mohammed Kudus', position: 'Orta Saha', jerseyNumber: 14 },
        { name: 'Crysencio Summerville', position: 'Orta Saha', jerseyNumber: 11 },
        { name: 'Michail Antonio', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Danny Ings', position: 'Forvet', jerseyNumber: 18 },
        { name: 'Jarrod Bowen', position: 'Forvet', jerseyNumber: 20 },
        { name: 'Niclas Füllkrug', position: 'Forvet', jerseyNumber: 15 }
      ];
      
    case 'Wolves':
      return [
        { name: 'José Sá', position: 'Kaleci', jerseyNumber: 1 },
        { name: 'Dan Bentley', position: 'Kaleci', jerseyNumber: 13 },
        { name: 'Nélson Semedo', position: 'Defans', jerseyNumber: 22 },
        { name: 'Max Kilman', position: 'Defans', jerseyNumber: 23 },
        { name: 'Craig Dawson', position: 'Defans', jerseyNumber: 15 },
        { name: 'Rayan Aït-Nouri', position: 'Defans', jerseyNumber: 3 },
        { name: 'Toti Gomes', position: 'Defans', jerseyNumber: 24 },
        { name: 'Santiago Bueno', position: 'Defans', jerseyNumber: 16 },
        { name: 'João Gomes', position: 'Orta Saha', jerseyNumber: 8 },
        { name: 'Mario Lemina', position: 'Orta Saha', jerseyNumber: 5 },
        { name: 'Pablo Sarabia', position: 'Orta Saha', jerseyNumber: 19 },
        { name: 'Matheus Cunha', position: 'Orta Saha', jerseyNumber: 12 },
        { name: 'Pedro Neto', position: 'Orta Saha', jerseyNumber: 7 },
        { name: 'Jean-Ricner Bellegarde', position: 'Orta Saha', jerseyNumber: 22 },
        { name: 'Hwang Hee-chan', position: 'Forvet', jerseyNumber: 11 },
        { name: 'Daniel Podence', position: 'Forvet', jerseyNumber: 10 },
        { name: 'Jorgen Strand Larsen', position: 'Forvet', jerseyNumber: 9 },
        { name: 'Rodrigo Gomes', position: 'Forvet', jerseyNumber: 27 }
      ];
    
    default:
      // Eğer takım listede yoksa, boş array döndür
      console.log(`${teamName} için oyuncu listesi tanımlanmamış.`);
      return [];
  }
}