const Discord = require('discord.js');
require('dotenv').config();

const client = new Discord.Client();
const prefix = '&';

const connected_channels = [];


const start = message => {
    if (!message.member.voiceChannel) {
        console.log(message.member);
        message.channel.send('You need to be in a voice channel to run that command.');
        return;
    }
    message.member.voiceChannel.join()
    .then(c => {
        connected_channels.push(c)
        message.channel.send('Connected!');
    })
    .catch(e => message.channel.send(`The following error occurred: ${e}`));
}

const stop = _ => {
    connected_channels.forEach(c => {
        c.disconnect();
    });
}

const run = (message) => {
    switch(message.content.slice(prefix.length)) {
        case 'start':
            start(message); break;
        case 'stop':
            stop(); break;
        default:
            help(); break;
    }
}

client.on('ready', () => {
    console.log('Ready!');
});

client.on('message', message => {
    if (message.content.startsWith(prefix)) {
        run(message);
    }
});

client.login(process.env.TOKEN);