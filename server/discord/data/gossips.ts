import { GossipItem } from '@shared/schema';

// Random gossip items for media
const mediaGossips: GossipItem[] = [
  {
    title: 'Transfer Dedikodası',
    content: 'Takımınızın yıldız orta sahası için yurt dışından teklif geldiği konuşuluyor. Oyuncunun menajeri görüşmeleri doğrulamadı ama yalanlama da gelmedi.',
    risk: 'medium',
    impact: {
      fanSupport: -5,
      managementTrust: 0,
      teamMorale: -5
    }
  },
  {
    title: 'Yönetim Anlaşmazlığı',
    content: 'Kulüp içi kaynaklara göre, yönetim kurulu son 3 maçtaki performans düşüklüğü nedeniyle teknik direktörle bir toplantı yapacak. Kritik kararlar alınabilir.',
    risk: 'high',
    impact: {
      fanSupport: -5,
      managementTrust: -10,
      teamMorale: -5
    }
  },
  {
    title: 'Soyunma Odası Gerginliği',
    content: 'Son idmanda iki önemli oyuncu arasında tartışma çıktığı iddia ediliyor. Kaptan duruma müdahale etmek zorunda kalmış.',
    risk: 'medium',
    impact: {
      fanSupport: -3,
      managementTrust: -3,
      teamMorale: -10
    }
  },
  {
    title: 'Sakatlık Şüphesi',
    content: 'Takımın gol kralı, son idmanda hafif bir sakatlık yaşamış olabilir. Resmi açıklama henüz yapılmadı ancak tedbirli davranıldığı söyleniyor.',
    risk: 'low',
    impact: {
      fanSupport: -3,
      managementTrust: 0,
      teamMorale: -3
    }
  },
  {
    title: 'Forma Satışları Rekoru',
    content: 'Son transferinizin forması rekor satış rakamlarına ulaştı. Taraftar bu transferi çok sevdi!',
    risk: 'low',
    impact: {
      fanSupport: 8,
      managementTrust: 5,
      teamMorale: 3
    }
  },
  {
    title: 'Yeni Taktik Sistemi',
    content: 'Teknik direktörün yeni bir taktik sistemi üzerinde çalıştığı konuşuluyor. Önümüzdeki maçta sürpriz bir diziliş görebiliriz.',
    risk: 'low',
    impact: {
      fanSupport: 5,
      managementTrust: 3,
      teamMorale: 0
    }
  },
  {
    title: 'Tribün Protestosu',
    content: 'Taraftar grupları, hafta sonu yapılacak maçta protesto düzenlemeyi planlıyor. İlk 10 dakika tezahürat yapmama kararı alındı.',
    risk: 'medium',
    impact: {
      fanSupport: -8,
      managementTrust: -5,
      teamMorale: -5
    }
  },
  {
    title: 'Genç Oyuncu İlgisi',
    content: 'Altyapıdan yükselen genç oyuncunuza büyük Avrupa kulüplerinden ilgi olduğu söyleniyor. Scoutlar son maçları takip ediyormuş.',
    risk: 'medium',
    impact: {
      fanSupport: 0,
      managementTrust: 5,
      teamMorale: 0
    }
  },
  {
    title: 'Disiplin Sorunu',
    content: 'Takımın yıldız savunmacısı, dün gece bir gece kulübünde görüntülendi. Maç öncesi kamp kurallarını ihlal ettiği iddia ediliyor.',
    risk: 'high',
    impact: {
      fanSupport: -5,
      managementTrust: -5,
      teamMorale: -5
    }
  },
  {
    title: 'Taraftardan Destek',
    content: 'Zorlu deplasman öncesi taraftar grupları takım otobüsünü meşalelerle uğurladı. Moral desteği göz doldurdu.',
    risk: 'low',
    impact: {
      fanSupport: 10,
      managementTrust: 0,
      teamMorale: 10
    }
  }
];

// Options for leaking gossip to media
const gossipLeakOptions: GossipItem[] = [
  {
    title: 'Transfer Dedikodusu',
    content: 'Büyük bir yıldız transfer edeceğiniz bilgisini sızdırırsın. Rakip takım moralini bozabilir.',
    risk: 'medium',
    impact: {
      fanSupport: 10,
      managementTrust: -5,
      teamMorale: 5
    }
  },
  {
    title: 'Yönetim Anlaşmazlığı',
    content: 'Kulüp yönetimiyle anlaşmazlık yaşadığını sızdırarak baskı oluştur.',
    risk: 'high',
    impact: {
      fanSupport: -10,
      managementTrust: -15,
      teamMorale: -5
    }
  },
  {
    title: 'Taktiğini Aç',
    content: 'Planlanan taktiğin bir bölümünü paylaş. Bu bir yanıltma taktiği olabilir.',
    risk: 'low',
    impact: {
      fanSupport: 5,
      managementTrust: -5,
      teamMorale: 0
    }
  },
  {
    title: 'Rakip Analizi',
    content: 'Rakip takımın zayıf noktalarını medyaya sızdır. Psikolojik üstünlük sağlayabilirsin.',
    risk: 'medium',
    impact: {
      fanSupport: 5,
      managementTrust: 0,
      teamMorale: 5
    }
  },
  {
    title: 'Yıldız Oyuncu Övgüsü',
    content: 'Takımın yıldızını aşırı övücü şekilde değerlendir. Oyuncuya moral verilebilir ama takımda kıskançlık yaratabilir.',
    risk: 'low',
    impact: {
      fanSupport: 5,
      managementTrust: 0,
      teamMorale: -3
    }
  },
  {
    title: 'Hakem Eleştirisi',
    content: 'Ligdeki hakem standartlarını eleştir. Taraftarları arkana alabilirsin ama federasyonla aran açılabilir.',
    risk: 'high',
    impact: {
      fanSupport: 15,
      managementTrust: -10,
      teamMorale: 0
    }
  },
  {
    title: 'İstifa İması',
    content: 'İstifa etmeyi düşündüğün imasını yayarak yönetimin sana olan desteğini ölç.',
    risk: 'high',
    impact: {
      fanSupport: -5,
      managementTrust: -10,
      teamMorale: -15
    }
  },
  {
    title: 'Antrenman Sertliği',
    content: 'Antrenmanların yoğunluğunu ve sertliğini vurgula. Rakiplere gözdağı ver.',
    risk: 'low',
    impact: {
      fanSupport: 5,
      managementTrust: 5,
      teamMorale: 5
    }
  }
];

// Function to get a random gossip
export function getRandomGossip(teamName: string | null | undefined): GossipItem {
  const randomIndex = Math.floor(Math.random() * mediaGossips.length);
  const gossip = mediaGossips[randomIndex];
  
  // Replace placeholders with team name if available
  if (teamName) {
    return {
      ...gossip,
      content: gossip.content.replace(/takımınız/g, teamName)
    };
  }
  
  return gossip;
}

// Function to get gossip options for leaking
export function getGossipOptions(): GossipItem[] {
  return gossipLeakOptions;
}
