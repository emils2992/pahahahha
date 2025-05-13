import { Collection } from 'discord.js';
import { basinCommand } from './basin';
import { kararCommand } from './karar';
import { kadroCommand, özürCommand, taktikCommand } from './kadro';
import { dedikoduCommand, sızdırCommand } from './medya';
import { yalanMakinesiCommand, hakemCommand, taraftarCommand, şampiyonlukSozuCommand } from './minigames';
import { takimCommand } from './takim';
import { bültenCommand } from './bülten';
import { helpCommand } from './help';
import { durumCommand } from './durum';

// Collection to store all commands
export const commands = new Collection();

// Register all commands
commands.set('basın', basinCommand);
commands.set('karar', kararCommand);
commands.set('kadrodisi', kadroCommand);
commands.set('özür', özürCommand);
commands.set('taktik', taktikCommand);
commands.set('dedikodu', dedikoduCommand);
commands.set('sızdır', sızdırCommand);
commands.set('yalanmakinesi', yalanMakinesiCommand);
commands.set('hakem', hakemCommand);
commands.set('taraftar', taraftarCommand);
commands.set('şampiyonluksozu', şampiyonlukSozuCommand); 
commands.set('takim', takimCommand);
commands.set('bülten', bültenCommand);
commands.set('help', helpCommand);
commands.set('yardım', helpCommand); // Turkish alternative for help
commands.set('durum', durumCommand);
