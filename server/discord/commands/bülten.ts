import { 
  Message, 
  MessageEmbed 
} from 'discord.js';
import { storage } from '../../storage';
import { checkUserTeam, createTutorialEmbed } from '../utils/helpers';
import { formatTimestamp } from '../utils/helpers';

// Daily bulletin command
export const bültenCommand = {
  name: 'bülten',
  description: 'Günlük bülten göster',
  usage: '.bülten',
  execute: async (message: Message, args: string[]) => {
    try {
      // Get user
      const user = await storage.getUserByDiscordId(message.author.id);
      if (!user) {
        return message.reply('Profil bulunamadı. Lütfen bir takım seçerek başlayın: `.takim [takım adı]`');
      }
      
      // Check if user has a team
      const hasTeam = await checkUserTeam(user, message);
      if (!hasTeam) return;
      
      // Get team info
      const team = await storage.getTeamByName(user.currentTeam as string);
      if (!team) {
        return message.reply('Takım bilgisi bulunamadı.');
      }
      
      // Generate bulletin content
      const bulletinItems = generateBulletinItems(user, team.name);
      
      // Create bulletin embed
      const bulletinEmbed = new MessageEmbed()
        .setColor('#5865F2')
        .setTitle(`📰 ${formatTimestamp(new Date(), 'date')} - Günlük Bülten`)
        .setDescription(`**${team.name}** kulübünün günlük bülteni`)
        .setFooter({ text: 'Futbol RP Bot - Günlük Bülten' });
      
      // Add bulletin items
      bulletinItems.forEach(item => {
        bulletinEmbed.addField(
          item.title,
          item.content,
          false
        );
      });
      
      // Send bulletin
      await message.reply({ embeds: [bulletinEmbed] });
      
      // Award points for checking bulletin
      await storage.addUserPoints(user.discordId, 1);
      
    } catch (error) {
      console.error('Error in bülten command:', error);
      message.reply('Bülten gösterme sırasında bir hata oluştu.');
    }
  }
};

// Helper function to generate bulletin items
function generateBulletinItems(user: any, teamName: string): { title: string; content: string; icon?: string }[] {
  const bulletinItems = [];
  
  // Training report
  const trainingReports = [
    `Bugün idmanda sertlik vardı. Oyuncular arasında küçük gerginlikler yaşandı ama kaptan araya girerek durumu sakinleştirdi.`,
    `Antrenman yüksek tempoda geçti. Oyuncular motive görünüyor.`,
    `Taktik ağırlıklı bir çalışma yapıldı. Teknik ekip yeni stratejiler üzerinde duruyor.`,
    `Hafif bir idman yapıldı. Oyuncular dinlendiriliyor.`,
    `İdmana yüksek katılım vardı. Sakat oyuncuların durumu iyiye gidiyor.`
  ];
  
  bulletinItems.push({
    title: '🏃 İdman Raporu',
    content: trainingReports[Math.floor(Math.random() * trainingReports.length)],
  });
  
  // Young player status
  const youngPlayerReports = [
    `Altyapıdan bir genç oyuncu formayı zorluyor. Antrenman performansıyla teknik ekibin dikkatini çekti.`,
    `Altyapıdan yükselen gençlerin gelişimi göz dolduruyor. Yakında A takımda şans bulabilirler.`,
    `U19 takımından parlayan oyuncularla profesyonel sözleşme için görüşmelere başlandı.`,
    `Genç akademi oyuncuları, antrenman performanslarıyla göz dolduruyor.`,
    `Altyapı maçlarında başarılı olan gençler, A takım idmanlarına katılmaya başladı.`
  ];
  
  bulletinItems.push({
    title: '👶 Genç Oyuncu Durumu',
    content: youngPlayerReports[Math.floor(Math.random() * youngPlayerReports.length)],
  });
  
  // Health status
  const healthReports = [
    `Sakatlığı bulunan oyuncuların tedavisi sürüyor. Sağlık ekibi olumlu gelişmeler olduğunu bildirdi.`,
    `Hafif sakatlık yaşayan oyuncular bireysel çalışmalarına devam ediyor.`,
    `Sağlık ekibi yoğun tempoya karşı önlemler alıyor. Oyunculara özel beslenme programı uygulanıyor.`,
    `Sağlık ekibi tüm oyuncuların durumunun iyi olduğunu bildirdi. Herhangi bir sakatlık sorunu yok.`,
    `Takımda bazı oyuncular yorgunluk belirtileri gösteriyor. Ekstra dinlenme programı uygulanıyor.`
  ];
  
  // Get a random health report that doesn't reference specific players
  bulletinItems.push({
    title: '🩺 Sağlık Durumu',
    content: healthReports[Math.floor(Math.random() * healthReports.length)],
  });
  
  // Opponent analysis
  const opponentReports = [
    `Önümüzdeki hafta karşılaşacağınız rakip takım son 5 maçında 3 galibiyet aldı. Orta sahada önemli eksikleri var.`,
    `Hafta sonu karşılaşacağınız rakip, son maçlarında savunmaya ağırlık veriyor. Kontratakları etkili.`,
    `Gelecek haftaki rakibiniz sakat ve cezalı oyuncularla boğuşuyor. Kadro derinliği sorun yaratabilir.`,
    `Analiz ekibi, rakibin duran top organizasyonlarının güçlü olduğu uyarısında bulundu.`,
    `Rakip takım son maçlarında yüksek pres uyguluyor. Teknik direktörleri taktik değişikliğine gitti.`
  ];
  
  bulletinItems.push({
    title: '📊 Rakip Analizi',
    content: opponentReports[Math.floor(Math.random() * opponentReports.length)],
  });
  
  // If team morale or management trust is low, add a special report
  if (user.teamMorale < 30) {
    bulletinItems.push({
      title: '⚠️ Soyunma Odası Uyarısı',
      content: `Takım morali tehlikeli seviyede düşük. Oyuncular arasında motivasyon sorunu yaşanıyor. Acil önlem almanız gerekebilir.`,
    });
  }
  
  if (user.managementTrust < 30) {
    bulletinItems.push({
      title: '⚠️ Yönetim Uyarısı',
      content: `Yönetim kurulu performansınızdan memnun değil. Önümüzdeki maçlar sizin için kritik olabilir.`,
    });
  }
  
  return bulletinItems;
}
