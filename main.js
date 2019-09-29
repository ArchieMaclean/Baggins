const Discord = require('discord.js');
const { Readable } = require('stream');
require('dotenv').config();
const fs = require('fs');
const opus = require('node-opus');


const SILENCE_FRAME = Buffer.from([0xF8,0xFF,0xFE]);

class Silence extends Readable {
    _read() {
        this.push(SILENCE_FRAME);
    }
}

const client = new Discord.Client();
const prefix = '&';

const connected_channels = [];
const log_channel = 'log'

function logAllEmitterEvents(eventEmitter)
{
    var emitToLog = eventEmitter.emit;

    eventEmitter.emit = function () {
        var event = arguments[0];
        console.log("event emitted: " + event);
        emitToLog.apply(eventEmitter, arguments);
    }
}


const log = message => {
    const ch = client.channels.find('name',log_channel);
    if (ch) ch.send(message);
}

const help = msg => {
    msg.channel.send('Recorder');
}

const start = message => {
    if (!message.member.voiceChannel) {
        console.log(message.member);
        message.channel.send('You need to be in a voice channel to run that command.');
        return;
    }
    message.member.voiceChannel.join()
    .then(c => {
        c.playOpusStream(new Silence());
        const receiver = c.createReceiver();
        c.on('speaking', (user, speaking) => {
            if (speaking) {
                let stream;
                let outStream;
                stream = receiver.createPCMStream(user);
                console.log(stream);
                // logAllEmitterEvents(stream);
                outStream = fs.createWriteStream('./data.pcm');
                stream.pipe(outStream);
                stream.on('readable', data => {
                    console.log(`readable: ${stream.read()}`);
                });
                stream.on('resume', data => {
                    console.log(`resume: ${stream.read()}`);
                });
                stream.on('end',_ => {
                    console.log('ended');
                    outStream.end();
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

const run = (message) => {
    switch(message.content.slice(prefix.length)) {
        case 'start':
            start(message); break;
        case 'stop':
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