require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. سيرفر Express لإبقاء البوت حياً (UptimeRobot)
// ==========================================
app.get('/', (req, res) => {
  res.send('Bot is running alive!');
});

app.listen(PORT, () => {
  console.log(`🌐 Server Express running on port ${PORT}`);
});

// ==========================================
// 2. إعدادات وتجهيز Discord Client
// ==========================================
const { 
  Client, 
  GatewayIntentBits, 
  REST, 
  Routes, 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits,
  AttachmentBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
// 3. تحديد أيديهات الرولات لكل أمر
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
  'trade':        [],
  'buy_request':  [],
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
// 4. قواعد البيانات والأسعار
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
// 5. بطاقات Canvas (الرصيد والحقيبة)
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
// 6. قائمة جميع أوامر السلاش (Slash Commands)
// ==========================================
const itemChoices = [
  { name: 'الماس', value: 'الماس' },
  { name: 'ذهب', value: 'ذهب' },
  { name: 'نحاس', value: 'نحاس' },
  { name: 'حديد', value: 'حديد' },
  { name: 'يورانيوم', value: 'يورانيوم' },
  { name: 'وقود', value: 'وقود' }
];

const commands = [
  new SlashCommandBuilder().setName('balance').setDescription('عرض بطاقة الرصيد المالية الخاصة بك أو لعضو آخر')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المراد معرفة رصيده (اختياري)')),
  new SlashCommandBuilder().setName('bag').setDescription('عرض الحقيبة والموارد التي تمتلكها'),
  new SlashCommandBuilder().setName('market').setDescription('عرض أسعار الموارد في السوق الحالي'),
  new SlashCommandBuilder().setName('give').setDescription('تحويل أو إعطاء مبلغ مالي لشخص آخر')
      .addUserOption(opt => opt.setName('target').setDescription('الشخص المراد تحويل المال له').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('trade').setDescription('عرض بيع موارد لعضو آخر')
      .addUserOption(opt => opt.setName('target').setDescription('المشتري').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('المورد').setRequired(true).addChoices(...itemChoices))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1))
      .addIntegerOption(opt => opt.setName('price').setDescription('السعر').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('buy-request').setDescription('إرسال طلب شراء موارد من عضو آخر')
      .addUserOption(opt => opt.setName('target').setDescription('البائع').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('المورد').setRequired(true).addChoices(...itemChoices))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1))
      .addIntegerOption(opt => opt.setName('price').setDescription('السعر المعروض').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('add-money').setDescription('إعطاء رصيد لعضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('remove-money').setDescription('خصم نقاط / رصيد مالي من عضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addIntegerOption(opt => opt.setName('amount').setDescription('المبلغ المراد خصمه').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('add-item').setDescription('إعطاء مورد لعضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true).addChoices(...itemChoices))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('remove-item').setDescription('خصم موارد من حقيبة عضو (للمشرفين)')
      .addUserOption(opt => opt.setName('target').setDescription('العضو المستهدف').setRequired(true))
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true).addChoices(...itemChoices))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية المراد خصمها').setRequired(true).setMinValue(1)),

  new SlashCommandBuilder().setName('buy').setDescription('شراء موارد من السوق')
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true).addChoices(...itemChoices))
      .addIntegerOption(opt => opt.setName('amount').setDescription('الكمية').setRequired(true).setMinValue(1)),
  new SlashCommandBuilder().setName('sell').setDescription('بيع موارد من حقيبتك للسوق')
      .addStringOption(opt => opt.setName('item').setDescription('اسم المورد').setRequired(true).addChoices(...itemChoices))
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
// 7. التسجيل الصحيح لمنع تكرار أوامر السلاش
// ==========================================
client.once('ready', async () => {
  console.log(`✅ البوت أونلاين الآن باسم: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(BOT_TOKEN);

  try {
      console.log('⏳ جاري إزالة أي أوامر مكررة وتحديث الأوامر الحالية...');

      if (GUILD_ID && GUILD_ID !== 'YOUR_GUILD_ID_HERE') {
          await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });
          await rest.put(
              Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
              { body: commands }
          );
          console.log('🚀 [تم بنجاح] مسح الأوامر القديمة وتسجيل أوامر السلاش بدون أي تكرار!');
      } else {
          await rest.put(
              Routes.applicationCommands(CLIENT_ID),
              { body: commands }
          );
          console.log('🚀 [تم بنجاح] تسجيل الأوامر عالمياً بدون تكرار.');
      }
  } catch (err) {
      console.error('❌ خطأ أثناء تحديث الأوامر:', err);
  }
});

// ==========================================
// 8. استقبال وتنفيذ أوامر السلاش والتفاعلات (Interactions)
// ==========================================
client.on('interactionCreate', async interaction => {
  // 1. التفاعل مع أزرار الصفحات التجارية (عرض بيع أو طلب شراء)
  if (interaction.isButton()) {
      if (interaction.customId.startsWith('trade_accept_') || interaction.customId.startsWith('trade_deny_') ||
          interaction.customId.startsWith('buyreq_accept_') || interaction.customId.startsWith('buyreq_deny_')) {
          
          const parts = interaction.customId.split('_');
          const type = parts[0]; // trade or buyreq
          const action = parts[1]; // accept or deny
          const sellerId = parts[2];
          const buyerId = parts[3];
          const item = parts[4];
          const amount = parseInt(parts[5]);
          const price = parseInt(parts[6]);

          // التحقق من الشخص المسموح له بالضغط
          const allowedUserId = (type === 'trade') ? buyerId : sellerId;
          if (interaction.user.id !== allowedUserId) {
              return interaction.reply({ content: '❌ هذا العرض ليس موهجاً لك!', ephemeral: true });
          }

          if (action === 'deny') {
              const cancelEmbed = new EmbedBuilder()
                  .setColor('Red')
                  .setTitle('❌ تم رفض الصفقة')
                  .setDescription(`تم رفض العرض التجاري بين <@${sellerId}> و <@${buyerId}>.`);
              return interaction.update({ embeds: [cancelEmbed], components: [] });
          }

          if (action === 'accept') {
              const sellerBag = getBag(sellerId);
              const buyerBalance = getBalance(buyerId);

              // التأكد من الموارد مع البائع
              if (!sellerBag[item] || sellerBag[item] < amount) {
                  return interaction.reply({ content: '❌ البائع لا يمتلك هذه الكمية الكافية من المورد حالياً!', ephemeral: true });
              }

              // التأكد من المبلغ مع المشتري
              if (buyerBalance < price) {
                  return interaction.reply({ content: `❌ المشتري لا يمتلك الرصيد الكافي (**${price.toLocaleString()}$**)!`, ephemeral: true });
              }

              // تنفيذ نقل الموارد والمال
              sellerBag[item] -= amount;
              const buyerBag = getBag(buyerId);
              buyerBag[item] = (buyerBag[item] || 0) + amount;

              userBalance.set(buyerId, buyerBalance - price);
              userBalance.set(sellerId, getBalance(sellerId) + price);

              const successEmbed = new EmbedBuilder()
                  .setColor('Green')
                  .setTitle('🤝 تم إتمام الصفقة التجارية بنجاح!')
                  .setDescription(`تم نقل **${amount}** من **${item}** من <@${sellerId}> إلى <@${buyerId}> مقابل **${price.toLocaleString()}$**.`);

              return interaction.update({ embeds: [successEmbed], components: [] });
          }
      }
      return;
  }

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
      const targetUser = interaction.options.getUser('target') || interaction.user;
      const buffer = await generateBalanceCard(targetUser, getBalance(targetUser.id));
      return interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: 'balance.png' })] });
  }

  if (commandName === 'trade') {
      const target = interaction.options.getUser('target');
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');
      const price = interaction.options.getInteger('price');

      if (target.id === interaction.user.id || target.bot) return interaction.reply({ content: '❌ لا يمكنك التداول مع نفسك أو مع البوتات!', ephemeral: true });

      const sellerBag = getBag(interaction.user.id);
      if (!sellerBag[item] || sellerBag[item] < amount) {
          return interaction.reply({ content: `❌ أنت لا تمتلك هذه الكمية من **${item}**!`, ephemeral: true });
      }

      const tradeEmbed = new EmbedBuilder()
          .setTitle('🤝 عرض بيع موارد')
          .setColor('Blue')
          .setDescription(`قام ${interaction.user} بتقديم عرض بيع لـ ${target}:\n\n` +
                          `📦 **المورد:** ${item}\n` +
                          `🔢 **الكمية:** ${amount}\n` +
                          `💰 **السعر المطلـوب:** ${price.toLocaleString()}$\n\n` +
                          `هل تقبل الشراء؟`);

      const buttonsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`trade_accept_${interaction.user.id}_${target.id}_${item}_${amount}_${price}`).setLabel('قبول الشراء 🟢').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`trade_deny_${interaction.user.id}_${target.id}_${item}_${amount}_${price}`).setLabel('رفض 🔴').setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ content: `${target}`, embeds: [tradeEmbed], components: [buttonsRow] });
  }

  if (commandName === 'buy-request') {
      const target = interaction.options.getUser('target'); // البائع
      const item = interaction.options.getString('item');
      const amount = interaction.options.getInteger('amount');
      const price = interaction.options.getInteger('price');

      if (target.id === interaction.user.id || target.bot) return interaction.reply({ content: '❌ لا يمكنك الطلب من نفسك أو البوتات!', ephemeral: true });

      const buyerBal = getBalance(interaction.user.id);
      if (buyerBal < price) {
          return interaction.reply({ content: `❌ رصيدك لا يكفي لدفع هذا المبلغ (**${price.toLocaleString()}$**)!`, ephemeral: true });
      }

      const requestEmbed = new EmbedBuilder()
          .setTitle('🛒 طلب شراء موارد')
          .setColor('Orange')
          .setDescription(`يرغب المشتري ${interaction.user} بشراء موارد من البائع ${target}:\n\n` +
                          `📦 **المورد:** ${item}\n` +
                          `🔢 **الكمية:** ${amount}\n` +
                          `💰 **السعر المعروض:** ${price.toLocaleString()}$\n\n` +
                          `هل تقبل بيع هذه الموارد؟`);

      const buttonsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`buyreq_accept_${target.id}_${interaction.user.id}_${item}_${amount}_${price}`).setLabel('قبول البيع 🟢').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`buyreq_deny_${target.id}_${interaction.user.id}_${item}_${amount}_${price}`).setLabel('رفض 🔴').setStyle(ButtonStyle.Danger)
      );

      return interaction.reply({ content: `${target}`, embeds: [requestEmbed], components: [buttonsRow] });
  }

  if (commandName === 'bag') {
      await interaction.deferReply();
      const buffer = await generateBagCard(interaction.user, getBag(interaction.user.id));
      return interaction.editReply({ files: [new AttachmentBuilder(buffer, { name: 'bag.png' })] });
  }

  if (commandName === 'market') {
      let embed = new EmbedBuilder().setTitle('🛒 أسعار السوق المالي الحالي').setColor('Gold');
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
      return interaction.reply({ embeds: [new EmbedBuilder().setTitle('🏆 قائمة أثرى 10 أعضاء').setDescription(desc || 'لا يوجد بيانات.').setColor('Yellow')] });
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
// 9. استقبال وتنفيذ الأوامر النصية المباشرة (Message Commands)
// ==========================================
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  const text = message.content.trim();
  const args = text.split(/\s+/);
  const cmd = args[0].toLowerCase();

  // 1. أمر الرصيد النصي (للشخص نفسه أو لعضو آخر) 💳
  if (cmd === 'رصيدي' || cmd === 'رصيد') {
      if (!isAllowedForCommand(message.member, 'balance')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });

      const targetMember = message.mentions.members.first() || message.member;
      const targetUser = targetMember.user;

      const buffer = await generateBalanceCard(targetUser, getBalance(targetUser.id));
      return message.reply({ files: [new AttachmentBuilder(buffer, { name: 'balance.png' })] });
  }

  // 2. أمر التجارة النصي (عرض بيع لعضو) 🤝
  if (cmd === 'تجارة' || cmd === 'تجاراه' || cmd === 'تداول') {
      if (!isAllowedForCommand(message.member, 'trade')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });

      const target = message.mentions.members.first();
      const item = args.find(arg => marketPrices[arg]);
      const numbers = args.filter(arg => !isNaN(parseInt(arg))).map(arg => parseInt(arg));

      if (!target || !item || numbers.length < 2 || target.id === message.author.id || target.user.bot) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `تجارة @العضو اسم_المورد الكمية السعر`\nمثال: `تجارة @user الماس 5 2000`')] });
      }

      const amount = numbers[0];
      const price = numbers[1];

      const sellerBag = getBag(message.author.id);
      if (!sellerBag[item] || sellerBag[item] < amount) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`أنت لا تمتلك هذه الكمية من **${item}**! لديك فقط (**${sellerBag[item] || 0}**).`)] });
      }

      const tradeEmbed = new EmbedBuilder()
          .setTitle('🤝 عرض بيع موارد')
          .setColor('Blue')
          .setDescription(`قام البائع ${message.author} بتقديم عرض بيع لـ ${target}:\n\n` +
                          `📦 **المورد:** ${item}\n` +
                          `🔢 **الكمية:** ${amount}\n` +
                          `💰 **السعر المطلوب:** ${price.toLocaleString()}$\n\n` +
                          `هل تقبل بهذا العرض؟`);

      const buttonsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`trade_accept_${message.author.id}_${target.id}_${item}_${amount}_${price}`).setLabel('قبول الصفقة 🟢').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`trade_deny_${message.author.id}_${target.id}_${item}_${amount}_${price}`).setLabel('رفض 🔴').setStyle(ButtonStyle.Danger)
      );

      return message.reply({ content: `${target}`, embeds: [tradeEmbed], components: [buttonsRow] });
  }

  // 3. أمر طلب شراء مورد من عضو آخر (نصي) 🛒
  if (cmd === 'طلب-شراء' || cmd === 'طلب_شراء' || cmd === 'اشتر-من') {
      if (!isAllowedForCommand(message.member, 'buy_request')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });

      const target = message.mentions.members.first(); // البائع
      const item = args.find(arg => marketPrices[arg]);
      const numbers = args.filter(arg => !isNaN(parseInt(arg))).map(arg => parseInt(arg));

      if (!target || !item || numbers.length < 2 || target.id === message.author.id || target.user.bot) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `طلب-شراء @البائع اسم_المورد الكمية السعر`\nمثال: `طلب-شراء @user ذهب 2 1000`')] });
      }

      const amount = numbers[0];
      const price = numbers[1];

      const buyerBal = getBalance(message.author.id);
      if (buyerBal < price) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`رصيدك لا يكفي لدفع هذا المبلغ! رصيدك: **${buyerBal.toLocaleString()}$** والسعر المطلـوب: **${price.toLocaleString()}$**`)] });
      }

      const requestEmbed = new EmbedBuilder()
          .setTitle('🛒 طلب شراء موارد من عضو')
          .setColor('Orange')
          .setDescription(`يرغب المشتري ${message.author} بشراء موارد من البائع ${target}:\n\n` +
                          `📦 **المورد:** ${item}\n` +
                          `🔢 **الكمية:** ${amount}\n` +
                          `💰 **السعر المعروض:** ${price.toLocaleString()}$\n\n` +
                          `هل تقبل بيع هذه الموارد؟`);

      const buttonsRow = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`buyreq_accept_${target.id}_${message.author.id}_${item}_${amount}_${price}`).setLabel('قبول البيع 🟢').setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId(`buyreq_deny_${target.id}_${message.author.id}_${item}_${amount}_${price}`).setLabel('رفض 🔴').setStyle(ButtonStyle.Danger)
      );

      return message.reply({ content: `${target}`, embeds: [requestEmbed], components: [buttonsRow] });
  }

  // 4. أمر الحقيبة النصي
  if (cmd === 'حقيبة' || cmd === 'حقيبه' || cmd === 'محفظة' || cmd === 'محفظه') {
      if (!isAllowedForCommand(message.member, 'bag')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const buffer = await generateBagCard(message.author, getBag(message.author.id));
      return message.reply({ files: [new AttachmentBuilder(buffer, { name: 'bag.png' })] });
  }

  // 5. أمر السوق النصي
  if (cmd === 'سوق' || cmd === 'السوق' || cmd === 'سوق-الموارد') {
      if (!isAllowedForCommand(message.member, 'market')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      let embed = new EmbedBuilder().setTitle('🛒 أسعار السوق المالي الحالي').setColor('Gold');
      for (const [item, price] of Object.entries(marketPrices)) {
          embed.addFields({ name: item, value: `**${price.toLocaleString()}**$`, inline: true });
      }
      return message.reply({ embeds: [embed] });
  }

  // 6. أمر شراء مورد من السوق النصي 🛒
  if (cmd === 'شراء' || cmd === 'اشتر') {
      if (!isAllowedForCommand(message.member, 'buy')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const item = args[1];
      const amount = parseInt(args[2]);

      if (!item || !marketPrices[item] || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `شراء اسم_المورد الكمية`\nالموارد المتاحة: (الماس, ذهب, نحاس, حديد, يورانيوم, وقود)')] });
      }

      const cost = marketPrices[item] * amount;
      const bal = getBalance(message.author.id);

      if (bal < cost) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`رصيدك غير كافي! تحتاج **${cost.toLocaleString()}$** ورصيدك الحالي **${bal.toLocaleString()}$**`)] });
      }

      userBalance.set(message.author.id, bal - cost);
      const bag = getBag(message.author.id);
      bag[item] = (bag[item] || 0) + amount;

      return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setTitle('🛒 عملية شراء ناجحة').setDescription(`تم شراء **${amount}** من **${item}** بمبلغ **${cost.toLocaleString()}$**`)] });
  }

  // 7. أمر بيع مورد للسوق النصي 💰
  if (cmd === 'بيع' || cmd === 'بع') {
      if (!isAllowedForCommand(message.member, 'sell')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const item = args[1];
      const amount = parseInt(args[2]);
      const bag = getBag(message.author.id);

      if (!item || !marketPrices[item] || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `بيع اسم_المورد الكمية`\nالموارد المتاحة: (الماس, ذهب, نحاس, حديد, يورانيوم, وقود)')] });
      }

      if (!bag[item] || bag[item] < amount) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription(`أنت لا تمتلك هذه الكمية! الكمية المتوفرة بحقيبتك من **${item}**: **${bag[item] || 0}**`)] });
      }

      const earn = marketPrices[item] * amount;
      bag[item] -= amount;
      userBalance.set(message.author.id, getBalance(message.author.id) + earn);

      return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setTitle('💰 عملية بيع ناجحة').setDescription(`تم بيع **${amount}** من **${item}** وجني **${earn.toLocaleString()}$**`)] });
  }

  // 8. أمر تحويل المال النصي
  if (cmd === 'تحويل' || cmd === 'اعطاء' || cmd === 'إعطاء') {
      if (!isAllowedForCommand(message.member, 'give')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args.find(arg => !isNaN(parseInt(arg))));
      
      if (!target || isNaN(amount) || amount <= 0 || target.id === message.author.id) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `تحويل @العضو المبلغ`')] });

      const senderBalance = getBalance(message.author.id);
      if (senderBalance < amount) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('رصيدك لا يكفي!')] });

      userBalance.set(message.author.id, senderBalance - amount);
      userBalance.set(target.id, getBalance(target.id) + amount);
      return message.reply({ embeds: [new EmbedBuilder().setColor('Green').setDescription(`تم تحويل **${amount.toLocaleString()}**$ إلى ${target}`)] });
  }

  // 9. أمر شحن / إضافة رصيد نصي (إداري)
  if (text.startsWith('اضف رصيد') || text.startsWith('أضف رصيد') || text.startsWith('شحن رصيد')) {
      if (!isAllowedForCommand(message.member, 'admin_give')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args.find(arg => !isNaN(parseInt(arg))));

      if (!target || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `شحن رصيد @العضو المبلغ` أو `اضف رصيد @العضو المبلغ`')] });
      }

      userBalance.set(target.id, getBalance(target.id) + amount);
      return message.reply({ embeds: [new EmbedBuilder().setColor('Gold').setTitle('👑 إضافة / شحن رصيد').setDescription(`تم شحن **${amount.toLocaleString()}**$ لحساب ${target}`)] });
  }

  // 10. أمر خصم رصيد نصي (إداري)
  if (text.startsWith('خصم رصيد') || text.startsWith('خصم نقاط')) {
      if (!isAllowedForCommand(message.member, 'admin_remove')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      const target = message.mentions.members.first();
      const amount = parseInt(args.find(arg => !isNaN(parseInt(arg))));

      if (!target || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `خصم رصيد @العضو المبلغ`')] });
      }

      const currentBal = getBalance(target.id);
      const newBal = Math.max(0, currentBal - amount);
      userBalance.set(target.id, newBal);

      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('🔻 خصم رصيد').setDescription(`تم خصم **${amount.toLocaleString()}**$ من ${target}\nالرصيد المتبقي: **${newBal.toLocaleString()}**$`)] });
  }

  // 11. أمر شحن / إضافة مورد نصي (إداري)
  if (text.startsWith('اضف مورد') || text.startsWith('أضف مورد') || text.startsWith('شحن مورد')) {
      if (!isAllowedForCommand(message.member, 'admin_give')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      
      const target = message.mentions.members.first();
      const item = args.find(arg => marketPrices[arg]);
      const amount = parseInt(args.find(arg => !isNaN(parseInt(arg))));

      if (!target || !item || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `اضف مورد @العضو اسم_المورد الكمية`\nالموارد المتاحة: (الماس, ذهب, نحاس, حديد, يورانيوم, وقود)')] });
      }

      const bag = getBag(target.id);
      bag[item] = (bag[item] || 0) + amount;
      return message.reply({ embeds: [new EmbedBuilder().setColor('Gold').setTitle('👑 إضافة / شحن مورد').setDescription(`تم إضافة **${amount}** من **${item}** إلى حقيبة ${target}`)] });
  }

  // 12. أمر خصم مورد نصي (إداري)
  if (text.startsWith('خصم مورد')) {
      if (!isAllowedForCommand(message.member, 'admin_remove')) return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('❌ ليس لديك الرتبة المسموح لها باستعمال هذا الأمر!')] });
      
      const target = message.mentions.members.first();
      const item = args.find(arg => marketPrices[arg]);
      const amount = parseInt(args.find(arg => !isNaN(parseInt(arg))));

      if (!target || !item || isNaN(amount) || amount <= 0) {
          return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setDescription('الاستخدام الصحيح: `خصم مورد @العضو اسم_المورد الكمية`\nالموارد المتاحة: (الماس, ذهب, نحاس, حديد, يورانيوم, وقود)')] });
      }

      const bag = getBag(target.id);
      const currentAmount = bag[item] || 0;
      const newAmount = Math.max(0, currentAmount - amount);
      bag[item] = newAmount;

      return message.reply({ embeds: [new EmbedBuilder().setColor('Red').setTitle('🔻 خصم مورد').setDescription(`تم خصم **${amount}** من **${item}** من حقيبة ${target}\nالكمية المتبقية: **${newAmount}**`)] });
  }
});

// ==========================================
// 10. تسجيل الدخول وتشغيل البوت
// ==========================================
client.login(BOT_TOKEN);