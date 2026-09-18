const fs = require('fs');
const path = require('path');
const settingPath = path.join(__dirname, '../data/groupSettings.json');

function loadSet(){
 if(!fs.existsSync(settingPath)){ fs.writeFileSync(settingPath, JSON.stringify({})); return {}; }
 return JSON.parse(fs.readFileSync(settingPath));
}
function saveSet(d){ fs.writeFileSync(settingPath, JSON.stringify(d, null, 2)); }

module.exports = {
 name: "protections",
 alias: ["antilink","antigstatus","antigroupmention","antispam","antidelete"],
 async execute(m, { args, isAdmin, isGroup, isBotAdmin }) {
  const cmd = m.body.split(' ')[0].replace('.', '').toLowerCase();
  if(!isGroup) return;
  if(!isAdmin) return m.reply("Admins only");

  let option = args[0]?.toLowerCase(); // on/off
  if(!['on','off'].includes(option)) return m.reply(`Use:.${cmd} on / off`);

  let settings = loadSet();
  if(!settings[m.from]) settings[m.from] = {};
  settings[m.from][cmd] = option === 'on';
  saveSet(settings);

  await m.reply(`✅ *${cmd}* is now ${option.toUpperCase()} for this group`);

  // Note: For actual kick/delete logic you need to add this check in index.js / message handler:
  // if settings[m.from].antilink and message has https:// -> kick
  // if antigstatus and message is status mention -> delete
  // if antispam -> track same messages
  // if antidelete -> store messages and send to bot DM when deleted
 }
}
