import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import "./index.css";

function App() {
  const [status, setStatus] = useState({ status: "loading", botStatus: "unknown" });
  
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data))
      .catch(err => console.error("Error fetching status:", err));
  }, []);

  return (
    <div className="min-h-screen bg-discord-bg text-discord-light flex flex-col">
      <header className="bg-discord-dark p-4 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-poppins font-bold text-white">Futbol RP Bot</h1>
          <div className="flex items-center space-x-2">
            <span className={`w-3 h-3 rounded-full ${status.botStatus === 'online' ? 'bg-discord-green' : 'bg-discord-red'}`}></span>
            <span>{status.botStatus === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto p-4 max-w-4xl">
        <div className="bg-gradient-to-r from-discord-blue to-blue-700 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="font-poppins font-bold text-2xl text-white mb-2">Hoş Geldin, Teknik Direktör!</h2>
          <p className="text-gray-200 mb-4">
            Discord botumuz başarıyla çalışıyor. Discord sunucunuza ekleyerek futbol teknik direktörlüğü simülasyonuna başlayabilirsiniz.
          </p>
        </div>
        
        <div className="bg-discord-sidebar rounded-lg p-6 shadow-md mb-8">
          <h2 className="font-poppins font-semibold text-xl mb-4 text-white">Komutlar</h2>
          <div className="space-y-3">
            <CommandItem
              name="basın"
              description="Basın toplantısı düzenle"
              usage=".yap basın [önce|sonra] [hoca adı]"
            />
            <CommandItem
              name="karar"
              description="Karar verme senaryosu"
              usage=".yap karar"
            />
            <CommandItem
              name="kadrodisi"
              description="Oyuncuyu kadro dışı bırak"
              usage=".yap kadrodisi [oyuncu adı]"
            />
            <CommandItem
              name="özür"
              description="Oyuncudan özür dile"
              usage=".yap özür [oyuncu adı]"
            />
            <CommandItem
              name="taktik"
              description="Taktik formasyonu belirle"
              usage=".yap taktik [formasyon]"
            />
            <CommandItem
              name="dedikodu"
              description="Medya dedikodularını göster"
              usage=".yap dedikodu"
            />
            <CommandItem
              name="sızdır"
              description="Medyaya bilgi sızdır"
              usage=".yap sızdır"
            />
            <CommandItem
              name="takim"
              description="Teknik direktörü olacağın takımı seç"
              usage=".yap takim [takım adı]"
            />
            <CommandItem
              name="bülten"
              description="Günlük bülteni göster"
              usage=".yap bülten"
            />
          </div>
        </div>
        
        <div className="bg-discord-sidebar rounded-lg p-6 shadow-md">
          <h2 className="font-poppins font-semibold text-xl mb-4 text-white">Minigames</h2>
          <div className="space-y-3">
            <CommandItem
              name="yalanmakinesi"
              description="Söylediğin ifadenin doğruluğunu test et"
              usage=".yap yalanmakinesi [ifade]"
            />
            <CommandItem
              name="hakem"
              description="Hakem kararlarına tepki ver"
              usage=".yap hakem"
            />
            <CommandItem
              name="taraftar"
              description="Taraftarlarla etkileşime geç"
              usage=".yap taraftar"
            />
            <CommandItem
              name="şampiyonluksozu"
              description="Şampiyonluk sözü ver/tut"
              usage=".yap şampiyonluksozu"
            />
          </div>
        </div>
      </main>
      
      <footer className="bg-discord-dark p-4 mt-8">
        <div className="container mx-auto text-center text-gray-400 text-sm">
          <p>Futbol RP Bot &copy; 2023 - Discord.js v13 Futbol Manager Roleplaying</p>
        </div>
      </footer>
    </div>
  );
}

function CommandItem({ name, description, usage }: { name: string; description: string; usage: string }) {
  return (
    <div className="bg-discord-dark p-4 rounded-md">
      <div className="font-medium text-white mb-1">{name}</div>
      <p className="text-sm text-discord-light mb-2">{description}</p>
      <div className="bg-black bg-opacity-30 p-2 rounded text-xs font-mono">
        {usage}
      </div>
    </div>
  );
}

const discord = {
  bg: "#36393F",
  dark: "#202225",
  sidebar: "#2F3136",
  light: "#DCDDDE",
  blue: "#5865F2",
  green: "#57F287",
  yellow: "#FEE75C",
  red: "#ED4245"
};

// Add custom Discord colors to Tailwind classes
document.documentElement.style.setProperty('--discord-bg', discord.bg);
document.documentElement.style.setProperty('--discord-dark', discord.dark);
document.documentElement.style.setProperty('--discord-sidebar', discord.sidebar);
document.documentElement.style.setProperty('--discord-light', discord.light);
document.documentElement.style.setProperty('--discord-blue', discord.blue);
document.documentElement.style.setProperty('--discord-green', discord.green);
document.documentElement.style.setProperty('--discord-yellow', discord.yellow);
document.documentElement.style.setProperty('--discord-red', discord.red);

createRoot(document.getElementById("root")!).render(<App />);
