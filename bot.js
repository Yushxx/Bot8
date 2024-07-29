const TelegramBot = require('node-telegram-bot-api');
const random = require('lodash/random');
const schedule = require('node-schedule');
const http = require('http');

// Remplacez 'YOUR_BOT_TOKEN' par le token de votre bot Telegram
const bot = new TelegramBot('6699800064:AAFfRByGTS9ecNJCA_VDdaNLxSVnEj_O8ss', { polling: true });

// Fonction pour générer une séquence de jeu de mines
function generateMineSequence() {
    const emojis = ['💎', '🟫']; // 💎 représente une mine, 🟫 représente une case sûre
    const rows = 5;
    const cols = 5;
    let sequence = '';
    let totalMineCount = 0;

    // Créer une séquence de 5x5 cases
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Déterminer si la case contient une mine ou non
            const isMine = Math.random() < 0.2 && totalMineCount < 5; // 20% de chance d'être une mine
            if (isMine) {
                totalMineCount++;
                sequence += '💎'; // Ajouter une mine
            } else {
                sequence += '🟫'; // Ajouter une case sûre
            }
        }
        sequence += '\n'; // Passer à la ligne pour la prochaine rangée
    }

    // Si le nombre total de mines est inférieur à 4, ajouter des mines supplémentaires à la fin
    while (totalMineCount < 4) {
        sequence = sequence.replace('🟫', '💎'); // Remplacer une case sûre par une mine
        totalMineCount++;
    }

    return sequence;
}

// Fonction pour générer une séquence de jeu Apple
function generateAppleSequence() {
    const sequence = ["🟩", "🟩", "🟩", "🟩", "🍎"];
    for (let i = sequence.length - 1; i > 0; i--) {
        const j = random(0, i);
        [sequence[i], sequence[j]] = [sequence[j], sequence[i]]; // Permuter les éléments
    }
    return sequence.join(" ");
}

// Modèles de séquences
const sequenceTemplateMine = `
🔔 CONFIRMED ENTRY!
💣 Mines : 3
🔐 Attempts: 3
⏰ Validity: 5 minutes
`;

const sequenceTemplateApple = `
🔔 CONFIRMED ENTRY!
🍎 Apple : 3
🔐 Attempts: 3
⏰ Validity: 5 minutes
`;

// Fonction pour envoyer une séquence de jeu de mines dans le canal Mine
function sendSequenceToMineChannel(chatId) {
    const sequenceMessage = `
${sequenceTemplateMine}
${generateMineSequence()}

🚨 FONCTIONNE UNIQUEMENT SUR 1XBET, MELBET & LINEBET AVEC LE CODE PROMO \`ZFree221\` ✅️ !

[S'inscrire](https://bit.ly/3NJ4vy0)
[Comment jouer](https://t.me/c/1594256026/1617)
`;

    // Options du clavier inline
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'S\'inscrire', url: 'https://bit.ly/3NJ4vy0' },
                { text: 'Comment jouer', url: 'https://t.me/c/1594256026/1617' }
            ]
        ]
    };

    // Envoi du message dans le canal Mine
    bot.sendMessage(chatId, sequenceMessage, { parse_mode: 'Markdown', reply_markup: inlineKeyboard });
}

// Fonction pour envoyer une séquence de jeu Apple dans le canal Apple
function sendSequenceToAppleChannel(chatId) {
    const sequenceMessage = `
${sequenceTemplateApple}
2.41:${generateAppleSequence()}
1.93:${generateAppleSequence()}
1.54:${generateAppleSequence()}
1.23:${generateAppleSequence()}

🚨 *Attention* les signaux ne fonctionnent que sur [Melbet](https://bit.ly/3Wk9323), 1xbet et Linebet avec le code promo \`ZFree221\` ✅️!

[Register on linebet](https://bit.ly/3v6rgFc)
`;

    // Options du clavier inline
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Register', url: 'https://bit.ly/3v6rgFc' },
                { text: 'How to play', url: 'https://t.me/c/2035790146/9350' }
            ]
        ]
    };

    // Envoi du message dans le canal Apple
    bot.sendMessage(chatId, sequenceMessage, { parse_mode: 'Markdown', reply_markup: inlineKeyboard });
}

// Planification des envois de séquences pour le canal Mine toutes les 20 minutes
const scheduledTimesMine = '*/20 8-23 * * *'; // Toutes les 20 minutes de 8h00 à 23h00
schedule.scheduleJob(scheduledTimesMine, () => {
    sendSequenceToMineChannel('-1001594256026'); // Canal Mine ID
});

// Planification des envois de séquences pour le canal Apple toutes les 20 minutes
const scheduledTimesApple = '*/20 8-23 * * *'; // Toutes les 20 minutes de 8h00 à 23h00
schedule.scheduleJob(scheduledTimesApple, () => {
    sendSequenceToAppleChannel('-1002035790146'); // Canal Apple ID
});

// Gérer la commande /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const inlineKeyboard = {
        inline_keyboard: [
            [
                { text: 'Voir la pomme', callback_data: 'voir_la_pomme' },
                { text: 'Test', callback_data: 'test_message' } // Bouton de test
            ]
        ]
    };
    const replyMarkup = { reply_markup: inlineKeyboard };

    bot.sendMessage(chatId, 'Cliquez sur "Voir la pomme" pour générer les séquences :', replyMarkup);
});

// Gérer le clic sur le bouton "Voir la pomme" ou "Test"
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'voir_la_pomme') {
        sendSequenceToAppleChannel(chatId);
    } else if (query.data === 'test_message') {
        sendSequenceToMineChannel(chatId); // Envoi de séquence au canal Mine pour le test
    }
});

// Code keep_alive pour éviter que le bot ne s'endorme
http.createServer(function (req, res) {
    res.write("I'm alive");
    res.end();
}).listen(8080);
