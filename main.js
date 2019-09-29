const Discord = require('discord.js');
const { Readable } = require('stream');
require('dotenv').config();
const fs = require('fs');
const opus = require('node-opus');
const spawn = require('child_process').spawn;


const SILENCE_FRAME = Buffer.from([0xF8,0xFF,0xFE]);

class Silence extends Readable {
    _read() {
        this.push(SILENCE_FRAME);
    }
}

const client = new Discord.Client();
const prefix = '&';

const connected_channels = [];


const getText = id => {
    const process = spawn('python3',['speech_rec.py',id]);
    return new Promise((res, rej) => {
        process.stdout.on('data', data => res(data.toString()));
        process.stdout.on('error', err => rej(err));
    });
}

async function log_audio(id,user) {
    getText(id)
    .then(text => {
        log(`${user.username} | ${new Date().toLocaleTimeString()}:
> ${text}`);
        // clean up files
        fs.unlink(`audio_files/${id}.pcm`, err => {
            if (err) throw(err);
        });
        fs.unlink(`audio_files/${id}.wav`, err => {
            if (err) throw(err);
        });
    })
    .catch(e => {
        console.log(e);
        log(`The following error occurred:
${err}`);
    })
}

const log = message => {
    const log_channel = client.channels.find(ch => ch.name === 'log')
    log_channel.send(message);
}

const help = msg => {
    msg.channel.send(`
Baggins - A Discord voice chat moderation bot
Commands:
> &help - show this message
> &connect - connect to current voice channel
> &disconnect - disconnect from all voice channels
`);
}

const start = message => {
    if (!message.member.voiceChannel) {
        message.channel.send('You need to be in a voice channel to run that command.');
        return;
    }
    message.member.voiceChannel.join()
    .then(c => {
        // This is a hack that enables the connection to receive data
        c.playOpusStream(new Silence());
        const receiver = c.createReceiver();
        c.on('speaking', (user, speaking) => {
            if (speaking) {
                // Use a random id to store files in - the files will be deleted once they're finished
                const id = Math.round(Math.random()*10000000);
                // Audio stream
                const stream = receiver.createPCMStream(user);
                const outStream = fs.createWriteStream(`audio_files/${id}.pcm`);
                stream.pipe(outStream);
                stream.on('end',_ => {
                    outStream.end();
                    log_audio(id,user);
                });
            }
        });
        connected_channels.push(c);
        message.channel.send('Connected!');
    })
    .catch(e => message.channel.send(`The following error occurred: ${e}`));
}

const stop = message => {
    connected_channels.forEach(c => {
        c.disconnect();
    });
    if (message) message.channel.send('Disconnected.')
}

const run = message => {
    switch(message.content.slice(prefix.length)) {
        case 'connect':
            start(message); break;
        case 'disconnect':
            stop(message); break;
        default:
            help(message); break;
    }
}

client.on('ready', () => {
    console.log('Ready!');
    stop();
});

client.on('message', message => {
    if (message.content.startsWith(prefix)) {
        run(message);
    }
});

client.login(process.env.TOKEN);