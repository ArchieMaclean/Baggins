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
let current_file = null;

const connected_channels = [];


const getText = id => {
    if (current_file === null) {
        current_file = (new Date).toUTCString()+'.wav';
        current_file = current_file.replace(/\s/g,'');
    }
    const process = spawn('python3',['speech_rec.py',id,current_file]);
    return new Promise((res, rej) => {
        process.stdout.on('data', data => res(data.toString()));
        process.stdout.on('error', err => rej(err));
    });
}

async function log_audio(id,user) {
    getText(id)
    .then(text => {
        log(`${user.username} | ${new Date().toLocaleTimeString()}:
> ${cleanMessage(text)}`);
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

const cleanMessage = (msg) => {
    // Caution: explicit material ahead!
    msg = msg.toLowerCase();
    const explicit = [/fuck/,/shit/,/porn/,/cunt/];
    for (const re of explicit) {
        msg = msg.replace(re,'\\*\\*\\*\\*');
    }
    return msg;
}

const log = message => {
    if (message.length === 0) return;
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
                const id = 'chunk'+Math.round(Math.random()*10000000);
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
    current_file = null;
    if (message) message.channel.send('Disconnected.')
}

const dump = message => {
    if (current_file != null) message.channel.send('Current recording:',{files: ['./audio_files/'+current_file]});
    else message.channel.send('No session currently.');
}

const run = message => {
    switch(message.content.slice(prefix.length)) {
        case 'connect':
            start(message); break;
        case 'disconnect':
            stop(message); break;
        case 'dump':
            dump(message); break;
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