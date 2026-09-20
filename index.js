require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// إنشاء سيرفر ويب بسيط ليستجيب لخدمة UptimeRobot
app.get('/', (req, res) => {
  res.send('Bot is running alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Server Express running on port ${PORT}`);
});

// باقي كود ديسكورد الخاص بك...
const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits,
  AttachmentBuilder
} = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID  = process.env.GUILD_ID;

const client = new Client({
  intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers
  ]
});

// ==========================================
// 0. تحديد أيديهات الرولات لكل أمر
// ==========================================
const COMMAND_ROLES = {
  'ban':          ['1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072'],
  'unban':        ['1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072'],
  'kick':         ['1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072'],
  'timeout':      ['1533544169073807411', '1533538549033472231', '1533128461886161047', '1533130679762550945', '1533130871186522273', '1533130750818259105', '1533544275873370122', '1533545048753573929', '1533543565626572820', '1533544417401770225', '1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967', '1515104776575258708'],
  'untimeout':    ['1533544169073807411', '1533538549033472231', '1533128461886161047', '1533130679762550945', '1533130871186522273', '1533130750818259105', '1533544275873370122', '1533545048753573929', '1533543565626572820', '1533544417401770225', '1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967', '1515104776575258708'],
  'lock':         ['1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967'],
  'unlock':       ['1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967'],
  'warn':         ['1533544169073807411', '1533538549033472231', '1533128461886161047', '1533130679762550945', '1533130871186522273', '1533130750818259105', '1533544275873370122', '1533545048753573929', '1533543565626572820', '1533544417401770225', '1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967', '1515104776575258708'],
  'unwarn':       ['1533544169073807411', '1533538549033472231', '1533128461886161047', '1533130679762550945', '1533130871186522273', '1533130750818259105', '1533544275873370122', '1533545048753573929', '1533543565626572820', '1533544417401770225', '1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967', '1515104776575258708'],
  'warnings':     ['1533544169073807411', '1533538549033472231', '1533128461886161047', '1533130679762550945', '1533130871186522273', '1533130750818259105', '1533544275873370122', '1533545048753573929', '1533543565626572820', '1533544417401770225', '1533545940999208961', '1533546100500201483', '1533130936999481534', '1533547914566177029', '1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072', '1534635942881529967', '1515104776575258708'],

  'admin_give':   ['1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072'],
  'admin_remove': ['1533548451701330101', '1533843524078796810', '1533122352194257018', '1533130578625433610', '1533130628889968860', '1515104781830586439', '1533130205961388072'],

  'balance':      [], 
  'bag':          [], 
  'market':       [], 
  'give':         [], 
  'buy':          [], 
  'sell':         [], 
  'leaderboard':  [], 
  'server':       []
};

function isAllowedForCommand(member, commandKey) {
  if (!member) return false;
  if (member.guild.ownerId === member.id) return true;
  if (member.permissions.has(PermissionFlagsBits.Administrator)) return true;

  const allowedRoles = COMMAND_ROLES[commandKey];
  if (!allowedRoles || allowedRoles.length === 0) return true;

  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

// ==========================================
// 1. قواعد البيانات والأسعار
// ==========================================
const userBalance = new Map();
const userBag = new Map();
const warnings = new Map();

const marketPrices = {
  'الماس': 1000,
  'ذهب': 500,
  'نحاس': 100,
  'حديد': 50,
  'يورانيوم': 2000,
  'وقود': 300
};

function updateMarketPrices() {
  for (const item in marketPrices) {
    const changePercent = (Math.random() * 0.3) - 0.15;
    let newPrice = Math.round(marketPrices[item] * (1 + changePercent));
    if (newPrice < 10) newPrice = 10;
    marketPrices[item] = newPrice;
  }
}
setInterval(updateMarketPrices, 60 * 60 * 1000);

function getBalance(userId) {
  if (!userBalance.has(userId)) userBalance.set(userId, 1000);
  return userBalance.get(userId);
}

function getBag(userId) {
  if (!userBag.has(userId)) {
      userBag.set(userId, { 'الماس': 0, 'ذهب': 0, 'نحاس': 0, 'حديد': 0, 'يورانيوم': 0, 'وقود': 0 });
  }
  return userBag.get(userId);
}

function canModerate(executor, target) {
  if (!target) return false;
  if (executor.guild.ownerId === target.id) return false;
  if (executor.id === executor.guild.ownerId) return true;
  return executor.roles.highest.position > target.roles.highest.position;
}

// ==========================================
// 2. بطاقات Canvas
// ==========================================
async function generateBalanceCard(user, balance) {
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0d0d0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 8;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  ctx.font = 'bold 36px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(user.username, 260, 150);

  ctx.fillStyle = '#18181c';
  ctx.fillRect(260, 230, 480, 120);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 3;
  ctx.strokeRect(260, 230, 480, 120);

  ctx.font = 'bold 28px Arial';
  ctx.fillStyle = '#d4af37';
  ctx.fillText('رصيدك:', 580, 280);

  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${balance.toLocaleString()}$`, 300, 310);

  try {
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(140, 225, 80, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 60, 145, 160, 160);
    ctx.restore();
  } catch (err) {}

  ctx.beginPath();
  ctx.arc(140, 225, 82, 0, Math.PI * 2, true);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

async function generateBagCard(user, bag) {
  const canvas = createCanvas(850, 480);
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#0b0b0e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth = 6;
  ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

  ctx.font = 'bold 32px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(user.username, 220, 100);

  try {
    const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));
    ctx.save();
    ctx.beginPath();
    ctx.arc(120, 120, 60, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 60, 60, 120, 120);
    ctx.restore();
  } catch (err) {}

  const items = [
      { name: 'الماس', key: 'الماس', color: '#00c3ff' },
      { name: 'ذهب', key: 'ذهب', color: '#ffd700' },
      { name: 'نحاس', key: 'نحاس', color: '#cd7f32' },
      { name: 'حديد', key: 'حديد', color: '#a0a0a0' },
      { name: 'يورانيوم', key: 'يورانيوم', color: '#39ff14' },
      { name: 'وقود', key: 'وقود', color: '#ff3333' }
  ];

  items.forEach((item, i) => {
      const x = 35 + i * 130;
      ctx.fillStyle = '#141418';
      ctx.fillRect(x, 240, 120, 180);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 240, 120, 180);

      ctx.font = 'bold 22px Arial';
      ctx.fillStyle = item.color;
      ctx.textAlign = 'center';
      ctx.fillText(item.name, x + 60, 305);

      const count = bag[item.key] || 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${count}`, x + 60, 373);
      ctx.textAlign = 'left';
  });

  return canvas.toBuffer('image/png');
}

// ==========================================
// 3. قائمة جميع أوامر السلاش (Slash Commands)
// ==========================================
const commands = [
  new SlashCommandBuilder().setName('balance').setDescription('عرض بطاقة الرصيد المالية الخاصة بك'),
  new SlashCommandBuilder().setName('bag').setDescription('عرض الحقيبة والموارد التي تمتلكها'),
  new SlashCommandBuilder().setName('market').setDescription('عرض أسعار الموارد في السوق الحالي'),
  new SlashCommandBuilder().setName('give').setDescription('تحويل أو إعطاء مبلغ مالي لشخص آخر')
      .addUserOption(opt => opt.setName('target').setDescription('الشخص المراد تحويل المال له').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true).setMinValue(1)),
  
  new SlashCommandBuilder().setName('add-money').setDescription('إعطاء رصيد لعضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('remove-money').setDescription('خصم نقاط / رصيد مالي من عضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ المراد خصمه').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('add-item').setDescription('إعطاء مورد لعضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true)
          .addChoices(
              { name: 'الماس', value: 'الماس' },
              { name: 'ذهب', value: 'ذهب' },
              { name: 'نحاس', value: 'نحاس' },
              { name: 'حديد', value: 'حديد' },
              { name: 'يورانيوم', value: 'يورانيوم' },
              { name: 'وقود', value: 'وقود' }
          ))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('remove-item').setDescription('خصم موارد من حقيبة عضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true)
          .addChoices(
              { name: 'الماس', value: 'الماس' },
              { name: 'ذهب', value: 'ذهب' },
              { name: 'نحاس', value: 'نحاس' },
              { name: 'حديد', value: 'حديد' },
              { name: 'يورانيوم', value: 'يورانيوم' },
              { name: 'وقود', value: 'وقود' }
          ))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية المراد خصمها').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('buy').setDescription('شراء موارد من السوق')
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('sell').setDescription('بيع موارد من حقيبتك للسوق')
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('leaderboard').setDescription('عرض قائمة أثرى 10 أعضاء'),
  new SlashCommandBuilder().setName('ban').setDescription('حظر عضو من السيرفر')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('السبب')),
  new SlashCommandBuilder().setName('unban').setDescription('فك الحظر عن عضو برقم ID')
      .addStringOption(opt => opt.setName('userid').setDescription('رقم ID العضو').setRequired(true)),
  new SlashCommandBuilder().setName('kick').setDescription('طرد عضو من السيرفر')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('السبب')),
  new SlashCommandBuilder().setName('timeout').setDescription('إعطاء تايم أوت لعضو')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addIntegerOption(opt => opt.setName('minutes').setDescription('المدة بالدقائق').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('untimeout').setDescription('إزالة التايم أوت عن عضو')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('قفل الروم الحالي'),
  new SlashCommandBuilder().setName('unlock').setDescription('فتح الروم الحالي'),
  new SlashCommandBuilder().setName('warn').setDescription('إعطاء تحذير لعضو')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('reason').setDescription('السبب')),
  new SlashCommandBuilder().setName('unwarn').setDescription('إزالة التحذيرات عن عضو')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true)),
  new SlashCommandBuilder().setName('warnings').setDescription('عرض تحذيرات عضو معين')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المراد فحص تحذيراته')),
  new SlashCommandBuilder().setName('server').setDescription('عرض معلومات السيرفر')
].map(cmd => cmd.toJSON());

// ==========================================
// 4. التسجيل الفوري الصحيح عند تجهيز البوت
// ==========================================
client.once('ready', async () => {
  console.log(`✅ البوت أونلاين الآن باسم: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  try {
      console.log('⏳ جاري رفع جميع الأوامر إلى ديسكورد...');
      
      if (GUILD_ID && GUILD_ID !== 'YOUR_GUILD_ID_HERE') {
          await rest.put(
              Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
              { body: commands }
          );
          console.log('🚀 [نجاح] تم تسجيل وتحديث كافة أوامر السلاش في سيرفرك مباشرة!');
      } else {
          await rest.put(
              Routes.applicationCommands(CLIENT_ID),
              { body: commands }
          );
          console.log('🚀 [نجاح] تم تسجيل أوامر السلاش عالمياً.');
      }
  } catch (err) {
      console.error('❌ خطأ أثناء إرسال الأوامر إلى ديسكورد:', err);
  }
});

// ==========================================
// 5. استقبال وتنفيذ أوامر السلاش (Interaction Handler)
// ==========================================
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  let requiredPermission = commandName;
  if (commandName === 'add-money' || commandName === 'add-item') {
      requiredPermission = 'admin_give';
  } else if (commandName === 'remove-money' || commandName === 'remove-item') {
      requiredPermission = 'admin_remove';
  }

  if (!isAllowedForCommand(interaction.member, requiredPermission)) {
    return interaction.reply({
      embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')],
      ephemeral: true
    });
  }

  if (commandName === 'balance') {
      await interaction.deferReply();
      const buffer = await generateBalanceCard(interaction.user, getBalance(interaction.user.id));
      return interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: 'balance.png' })] });
  }

  if (commandName === 'bag') {
      await interaction.deferReply();
      const buffer = await generateBagCard(interaction.user, getBag(interaction.user.id));
      return interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: 'bag.png' })] });
  }

  if (commandName === 'market') {
      let embed = new EmbedBuilder().setTitle('أسعار السوق المالي الحالي').setColor('Gold');
      for (const [item, price] of Object.entries(marketPrices)) {
          embed.addFields({ name: item, value: `**${price.toLocaleString()}**$`, inline: true });
      }
      return interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'give') {
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');

      if (target.id === interaction.user.id || target.bot) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('عملية تحويل غير صالحة!')], ephemeral: true });
      }

      const senderBalance = getBalance(interaction.user.id);
      if (senderBalance < amount) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('رصيدك لا يكفي!')], ephemeral: true });
      }

      userBalance.set(interaction.user.id, senderBalance - amount);
      userBalance.set(target.id, getBalance(target.id) + amount);

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setTitle('💸 تحويل ناجح').setDescription(`تم تحويل **${amount.toLocaleString()}**$ إلى <@${target.id}>`)] });
  }

  if (commandName === 'add-money') {
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');

      userBalance.set(target.id, getBalance(target.id) + amount);

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Gold').setTitle('👑 إضافة رصيد').setDescription(`تم منح **${amount.toLocaleString()}**$ إلى <@${target.id}>`)] });
  }

  if (commandName === 'remove-money') {
      const target = interaction.options.getUser('target');
      const amount = interaction.options.getInteger('amount');

      const currentBal = getBalance(target.id);
      const newBal = Math.max(0, currentBal - amount);
      userBalance.set(target.id, newBal);

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('🔻 خصم رصيد').setDescription(`تم خصم **${amount.toLocaleString()}**$ من <@${target.id}>\nالرصيد المتبقي: **${newBal.toLocaleString()}**$`)] });
  }

  if (commandName === 'add-item') {
      const target = interaction.options.getUser('target');
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');

      const bag = getBag(target.id);
      bag[item] = (bag[item] || 0) + amount;

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Gold').setTitle('👑 إضافة مورد').setDescription(`تم منح **${amount}** من **${item}** إلى <@${target.id}>`)] });
  }

  if (commandName === 'remove-item') {
      const target = interaction.options.getUser('target');
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');

      const bag = getBag(target.id);
      const currentAmount = bag[item] || 0;
      const newAmount = Math.max(0, currentAmount - amount);
      bag[item] = newAmount;

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('🔻 خصم مورد').setDescription(`تم خصم **${amount}** من **${item}** من <@${target.id}>\nالكمية المتبقية: **${newAmount}**`)] });
  }

  if (commandName === 'buy') {
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');
      if (!marketPrices[item]) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('المورد غير موجود!')], ephemeral: true });

      const cost = marketPrices[item] * amount;
      const bal = getBalance(interaction.user.id);
      if (bal < cost) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('رصيدك غير كافي!')], ephemeral: true });

      userBalance.set(interaction.user.id, bal - cost);
      const bag = getBag(interaction.user.id);
      bag[item] = (bag[item] || 0) + amount;

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم شراء **${amount}** من **${item}** بمبلغ **${cost.toLocaleString()}$**`)] });
  }

  if (commandName === 'sell') {
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');
      const bag = getBag(interaction.user.id);

      if (!marketPrices[item] || !bag[item] || bag[item] < amount) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الكمية غير متوفرة!')], ephemeral: true });
      }

      const earn = marketPrices[item] * amount;
      bag[item] -= amount;
      userBalance.set(interaction.user.id, getBalance(interaction.user.id) + earn);

      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم بيع **${amount}** من **${item}** وجني **${earn.toLocaleString()}$**`)] });
  }

  if (commandName === 'leaderboard') {
      const sorted = Array.from(userBalance.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
      let desc = sorted.map(([id, bal], i) => `**#${i + 1}** <@${id}> - \`${bal.toLocaleString()}$\``).join('\n');
      return interaction.reply({ embeds: [new EmbedBuilder().setTitle('قائمة أثرى 10 أعضاء').setDescription(desc || 'لا يوجد بيانات.').setColor('Yellow')] });
  }

  if (commandName === 'ban') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target) || !target.bannable) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('لا يمكنك حظر هذا الشخص!')], ephemeral: true });
      }
      const reason = interaction.options.getString('reason') || 'بدون سبب';
      await target.ban({ reason });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('DarkRed').setDescription(`تم حظر العضو: ${target.user.tag}`)] });
  }

  if (commandName === 'unban') {
      const userId = interaction.options.getString('userid');
      try {
          await interaction.guild.members.unban(userId);
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم فك الحظر عن ID: ${userId}`)] });
      } catch {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('تعذر فك الحظر!')], ephemeral: true });
      }
  }

  if (commandName === 'kick') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target) || !target.kickable) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('لا يمكنك طرد هذا الشخص!')], ephemeral: true });
      }
      await target.kick();
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Orange').setDescription(`تم طرد: ${target.user.tag}`)] });
  }

  if (commandName === 'timeout') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target) || !target.moderatable) {
          return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('لا يمكنك إعطاء تايم أوت لهذا الشخص!')], ephemeral: true });
      }
      const minutes = interaction.options.getInteger('minutes');
      await target.timeout(minutes * 60 * 1000);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('DarkOrange').setDescription(`تم إعطاء تايم أوت لمدة ${minutes} دقائق لـ ${target.user.tag}`)] });
  }

  if (commandName === 'untimeout') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target)) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('خطأ في الصلاحيات!')], ephemeral: true });
      await target.timeout(null);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم إزالة التايم أوت عن ${target.user.tag}`)] });
  }

  if (commandName === 'lock') {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('DarkRed').setDescription(`تم قفل الروم.`)] });
  }

  if (commandName === 'unlock') {
      await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: true });
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم فتح الروم.`)] });
  }

  if (commandName === 'warn') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target)) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('خطأ بالصلاحيات!')], ephemeral: true });
      const reason = interaction.options.getString('reason') || 'بدون سبب';
      if (!warnings.has(target.id)) warnings.set(target.id, []);
      warnings.get(target.id).push(reason);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Gold').setDescription(`تم تحذير: ${target.user.tag}`)] });
  }

  if (commandName === 'unwarn') {
      const target = interaction.options.getMember('target');
      if (!target || !canModerate(interaction.member, target)) return interaction.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('خطأ بالصلاحيات!')], ephemeral: true });
      warnings.set(target.id, []);
      return interaction.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم إزالة تحذيرات ${target.user.tag}`)] });
  }

  if (commandName === 'warnings') {
      const target = interaction.options.getMember('target') || interaction.member;
      const userWarns = warnings.get(target.id) || [];
      return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`تحذيرات ${target.user.username}`).setDescription(`العدد: **${userWarns.length}**`).setColor('Blue')] });
  }

  if (commandName === 'server') {
      return interaction.reply({ embeds: [new EmbedBuilder().setTitle(`معلومات ${interaction.guild.name}`).addFields({ name: 'عدد الأعضاء', value: `${interaction.guild.memberCount}` }).setColor('DarkGreen')] });
  }
});

// ==========================================
// 6. استقبال وتنفيذ الأوامر النصية المباشرة
// ==========================================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const text = message.content.trim();
  const args = text.split(/\s+/);
  const cmd = args[0];

  if (cmd === 'رصيدي' || cmd === 'رصيد') {
      if (!isAllowedForCommand(message.member, 'balance')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const buffer = await generateBalanceCard(message.author, getBalance(message.author.id));
      return message.reply({ files: [new AttachmentBuilder(buffer, { name: 'balance.png' })] });
  }

  if (cmd === 'حقيبة' || cmd === 'حقيبه' || cmd === 'محفظة' || cmd === 'محفظه') {
      if (!isAllowedForCommand(message.member, 'bag')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const buffer = await generateBagCard(message.author, getBag(message.author.id));
      return message.reply({ files: [new AttachmentBuilder(buffer, { name: 'bag.png' })] });
  }

  if (cmd === 'تحويل' || cmd === 'اعطاء' || cmd === 'إعطاء') {
      if (!isAllowedForCommand(message.member, 'give')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args[2]);
      if (!target || isNaN(amount) || amount <= 0 || target.id === message.author.id) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `تحويل @العضو المبلغ`')] });

      const senderBalance = getBalance(message.author.id);
      if (senderBalance < amount) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('رصيدك لا يكفي!')] });

      userBalance.set(message.author.id, senderBalance - amount);
      userBalance.set(target.id, getBalance(target.id) + amount);
      return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم تحويل **${amount.toLocaleString()}**$ إلى ${target}`)] });
  }

  if (text.startsWith('اضف رصيد') || text.startsWith('أضف رصيد') || text.startsWith('شحن رصيد')) {
      if (!isAllowedForCommand(message.member, 'admin_give')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args[3]);
      if (!target || isNaN(amount) || amount <= 0) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `اضف رصيد @العضو المبلغ`')] });

      userBalance.set(target.id, getBalance(target.id) + amount);
      return message.reply({ embeds: [new EmbedBuilder().setColor('Gold').setDescription(`تم منح **${amount.toLocaleString()}**$ إلى ${target}`)] });
  }

  if (text.startsWith('خصم رصيد') || text.startsWith('خصم نقاط')) {
      if (!isAllowedForCommand(message.member, 'admin_remove')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args[3]);
      if (!target || isNaN(amount) || amount <= 0) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `خصم رصيد @العضو المبلغ`')] });

      const currentBal = getBalance(target.id);
      const newBal = Math.max(0, currentBal - amount);
      userBalance.set(target.id, newBal);

      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('🔻 خصم رصيد').setDescription(`تم خصم **${amount.toLocaleString()}**$ من ${target}\nالرصيد المتبقي: **${newBal.toLocaleString()}**$`)] });
  }
});

// ==========================================
// 7. تسجيل الدخول وتشغيل البوت
// ==========================================
client.login(BOT_TOKEN);