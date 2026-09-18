const fs = require('fs');
const path = require('path');
const welcomePath = path.join(__dirname, '../data/welcome.json');

module.exports = {
 name: "gamersadmin",
 alias: ["kick","mute","add","desc","setwelcome","members","gs","ping"],
 async execute(m, { sock, args, isAdmin, isBotAdmin, isGroup, groupMetadata }) {
  const cmd = m.body.split(' ')[0].replace('.', '').toLowerCase();

  if(cmd === 'ping'){
    let start = Date.now();
    await m.reply(`*GAMERS HUB MD*\nPong! ${Date.now()-start}ms\nBot is Online ✅`);
  }

  if(!isGroup) return;
  if(!isAdmin &&!["ping","members"].includes(cmd)) return m.reply("Admins only");
  if(!isBotAdmin && ["kick","mute","add"].includes(cmd)) return m.reply("Make bot admin first");

  if(cmd === 'kick'){
    let user = m.mentionedJid[0] || (m.quoted? m.quoted.sender : null);
    if(!user) return m.reply("Tag or reply to user to kick\n.kick @user");
    await sock.groupParticipantsUpdate(m.from, [user], "remove");
    await m.reply("✅ Kicked");
  }

  if(cmd === 'add'){
    let num = args[0]?.replace(/[^0-9]/g,'');
    if(!num) return m.reply("Use.add 2348012345678");
    await sock.groupParticipantsUpdate(m.from, [num+"@s.whatsapp.net"], "add");
  }

  if(cmd === 'mute'){
    await sock.groupSettingUpdate(m.from, 'announcement');
    await m.reply("🔇 Group muted - Only admins can chat");
  }

  if(cmd === 'desc'){
    let newDesc = args.join(' ');
    if(!newDesc) return m.reply("Use.desc New group description");
    await sock.groupUpdateDescription(m.from, newDesc);
    await m.reply("✅ Description updated");
  }

  if(cmd === 'setwelcome'){
    let text = args.join(' ');
    if(!text) return m.reply("Use.setwelcome Welcome to GAMERS HUB, enjoy!");
    let data = fs.existsSync(welcomePath)? JSON.parse(fs.readFileSync(welcomePath)) : {};
    data[m.from] = text;
    fs.writeFileSync(welcomePath, JSON.stringify(data, null, 2));
    await m.reply(`✅ Welcome set:\n${text}`);
  }

  if(cmd === 'members'){
    let mems = groupMetadata.participants.map(p => `@${p.id.split('@')[0]}`).join('\n');
    await sock.sendMessage(m.from, { text: `*GROUP MEMBERS (${groupMetadata.participants.length})*\n\n${mems}`, mentions: groupMetadata.participants.map(p=>p.id) }, {quoted: m});
  }

  if(cmd === 'gs'){
    // reply to something to post to group status? Actually group status doesn't exist, we post as bot status for group members
    if(!m.quoted) return m.reply("Reply to image/video/text to post as Status\n.gs reply to something");
    let msg = m.quoted;
    let content = await sock.downloadMediaMessage? await sock.downloadMediaMessage(msg) : null;
    // For now forward the quoted message to all members as status-like broadcast
    await sock.sendMessage(m.from, { forward: msg }, {quoted: m});
    await m.reply("✅ Posted to group (status mode)");
  }
 }
      }
