// Gossip data

// Get a random gossip
function getRandomGossip(teamName) {
  const gossips = getGossipOptions();
  
  // If there's a team name, customize some gossips
  if (teamName) {
    const teamGossips = gossips.filter(g => g.title.includes('TEAM'));
    
    // Replace placeholders with actual team name in selected gossips
    teamGossips.forEach(gossip => {
      gossip.title = gossip.title.replace('TEAM', teamName);
      gossip.content = gossip.content.replace(/TEAM/g, teamName);
    });
  }
  
  // Choose a random gossip
  return gossips[Math.floor(Math.random() * gossips.length)];
}

// Get all gossip options
function getGossipOptions() {
  return [
    {
      title: 'Transfer Dedikodusu',
      content: 'Önemli bir oyuncunuzun büyük bir kulüpten teklif aldığı söyleniyor. Oyuncunun teklife sıcak baktığı iddia ediliyor.',
      risk: 'medium',
      impact: {
        fanSupport: -5,
        managementTrust: 0,
        teamMorale: -10
      }
    },
    {
      title: 'Sakatlık Endişesi',
      content: 'Takımın yıldız oyuncusunun antrenman sırasında sakatlandığı, durumunun ciddi olabileceği söylentisi yayıldı.',
      risk: 'medium',
      impact: {
        fanSupport: -8,
        managementTrust: 0,
        teamMorale: -5
      }
    },
    {
      title: 'TEAM Yönetim Krizi',
      content: 'TEAM kulübünde yönetim kurulu üyeleri arasında anlaşmazlık çıktığı ve bazı üyelerin istifa etmeyi düşündüğü iddia ediliyor.',
      risk: 'high',
      impact: {
        fanSupport: -10,
        managementTrust: -15,
        teamMorale: -5
      }
    },
    {
      title: 'Soyunma Odası Gerginliği',
      content: 'Takım içinde bazı oyuncular arasında gerginlik olduğu ve bu durumun sahaya yansıdığı iddia ediliyor.',
      risk: 'medium',
      impact: {
        fanSupport: -5,
        managementTrust: -5,
        teamMorale: -10
      }
    },
    {
      title: 'Teknik Direktör Değişikliği Söylentisi',
      content: 'Kulüp yönetiminin teknik direktör değişikliği için görüşmeler yaptığı iddia ediliyor.',
      risk: 'high',
      impact: {
        fanSupport: -5,
        managementTrust: -15,
        teamMorale: -10
      }
    },
    {
      title: 'Mali Sorunlar',
      content: 'Kulübün mali sorunlarla karşı karşıya olduğu ve önümüzdeki transfer döneminde harcama yapamayacağı iddia ediliyor.',
      risk: 'high',
      impact: {
        fanSupport: -12,
        managementTrust: -10,
        teamMorale: -8
      }
    },
    {
      title: 'Taraftar Protestosu',
      content: 'Taraftar gruplarının önümüzdeki maçta protest gösteriler düzenlemeyi planladığı iddia ediliyor.',
      risk: 'medium',
      impact: {
        fanSupport: -10,
        managementTrust: -5,
        teamMorale: -7
      }
    },
    {
      title: 'Oyuncu Disiplinsizliği',
      content: 'Takımın önemli oyuncularından birinin gece geç saatlerde bir eğlence mekanında görüldüğü iddia ediliyor.',
      risk: 'medium',
      impact: {
        fanSupport: -7,
        managementTrust: -5,
        teamMorale: -3
      }
    },
    {
      title: 'Yeni Transfer Anlaşması',
      content: 'Kulübün yeni bir yıldız oyuncu için anlaşmaya vardığı ancak henüz resmi açıklama yapılmadığı iddia ediliyor.',
      risk: 'low',
      impact: {
        fanSupport: 10,
        managementTrust: 5,
        teamMorale: -2
      }
    },
    {
      title: 'Maç Şike İddiaları',
      content: 'Geçtiğimiz hafta oynanan maçta şike yapıldığı iddiaları gündeme geldi. Soruşturma başlatılabileceği söyleniyor.',
      risk: 'high',
      impact: {
        fanSupport: -15,
        managementTrust: -20,
        teamMorale: -15
      }
    },
    {
      title: 'TEAM Stadyum Projesi',
      content: 'TEAM kulübünün yeni stadyum projesi için finansman sağladığı ve yakında inşaata başlanacağı iddia ediliyor.',
      risk: 'low',
      impact: {
        fanSupport: 15,
        managementTrust: 10,
        teamMorale: 5
      }
    },
    {
      title: 'Yıldız Oyuncu Mutsuzluğu',
      content: 'Takımın yıldız oyuncusunun kulüpten ayrılmak istediği ve menajerinin transfer görüşmeleri yaptığı iddia ediliyor.',
      risk: 'high',
      impact: {
        fanSupport: -10,
        managementTrust: -5,
        teamMorale: -12
      }
    },
    {
      title: 'Yönetim Desteği',
      content: 'Kulüp başkanının teknik direktöre tam destek verdiği ve uzun vadeli planlar yaptıkları iddia ediliyor.',
      risk: 'low',
      impact: {
        fanSupport: 5,
        managementTrust: 15,
        teamMorale: 10
      }
    },
    {
      title: 'Altyapı Yatırımı',
      content: 'Kulübün altyapıya büyük yatırım yapacağı ve önümüzdeki yıllarda genç oyunculara daha fazla şans verileceği iddia ediliyor.',
      risk: 'low',
      impact: {
        fanSupport: 8,
        managementTrust: 10,
        teamMorale: 5
      }
    },
    {
      title: 'Taktik Değişikliği',
      content: 'Teknik direktörün büyük bir taktik değişikliğine gideceği ve bazı kritik oyuncuların formayı kaybedeceği iddia ediliyor.',
      risk: 'medium',
      impact: {
        fanSupport: -5,
        managementTrust: 0,
        teamMorale: -8
      }
    }
  ];
}

module.exports = {
  getRandomGossip,
  getGossipOptions
};