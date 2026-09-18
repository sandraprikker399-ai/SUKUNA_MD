const fs = require('fs');
const path = require('path');
const listPath = path.join(__dirname, '../data/gamers_list.json');

function loadList(){
 if(!fs.existsSync(listPath)) { fs.writeFileSync(listPath, JSON.stringify([])); return []; }
 return JSON.parse(fs.readFileSync(listPath));
}
function saveList(data){ fs.writeFileSync(listPath, JSON.stringify(data, null, 2)); }

module.exports = {
 name: "gamershop",
 alias: ["list","olist","rlist"],
 async execute(m, { sock, args, isAdmin, isGroup }) {
  const cmd = m.body.split(' ')[0].replace('.', '').toLowerCase();

  //.list - Everyone can use
  if(cmd === 'list'){
   let items = loadList();
   if(items.length === 0) return m.reply("🎮 *GAMERS HUB*\nNo games listed yet. Admins use.olist to add.");
   let msg = `🎮 *GAMERS HUB - STORE*\n\n`;
   for(let i=0;i<items.length;i++){
     msg += `*${i+1}. ${items[i].name}* - N${items[i].price}\n${items[i].desc}\n\n`;
   }
   msg += `To buy, contact admin or type.buy`;
   // if items have image, send with image
   if(items[0] && items[0].image){
     await sock.sendMessage(m.from, { image: { url: items[0].image }, caption: msg }, { quoted: m });
   } else {
     await m.reply(msg);
   }
  }

  //.olist - Admin only:.olist GTA5 | 5000 | Best open world | [reply to image]
  if(cmd === 'olist'){
   if(!isGroup ||!isAdmin) return m.reply("Admins only");
   // format:.olist name | price | description
   let text = args.join(' ').split('|');
   if(text.length < 2) return m.reply("Use:.olist GameName | Price | Description\nAnd reply to a picture with the command for image");
   let name = text[0].trim();
   let price = text[1].trim();
   let desc = text[2]? text[2].trim() : "No description";
   let image = null;
   // check if replied to image
   if(m.quoted && m.quoted.mtype === 'imageMessage'){
     image = await sock.downloadMediaMessage(m.quoted);
     // save image url? For simplicity save as base64 path
     // we will just store that it has image
     // In real bot save to./data/images
     image = m.quoted.download? "has_image" : null;
   }
   let items = loadList();
   items.push({ name, price, desc, image: null, id: Date.now() });
   saveList(items);
   await m.reply(`✅ Added to list:\n*${name}* - N${price}`);
  }

  //.rlist - Admin only:.rlist 1
  if(cmd === 'rlist'){
   if(!isGroup ||!isAdmin) return m.reply("Admins only");
   let index = parseInt(args[0]) - 1;
   let items = loadList();
   if(isNaN(index) ||!items[index]) return m.reply("Use:.rlist number\nExample:.rlist 1");
   let removed = items.splice(index,1);
   saveList(items);
   await m.reply(`🗑️ Removed: ${removed[0].name}`);
  }
 }
 }
