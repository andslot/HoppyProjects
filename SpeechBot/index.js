require('dotenv').config(); // initialize dotenv
const { Client, Intents, Message } = require('discord.js'); //import discord.js
const { joinVoiceChannel, getVoiceConnection, createDefaultAudioReceiveStreamOptions, PlayerSubscription } = require('@discordjs/voice') // import discord.js voice support
const config = require('./config.json'); // import bot specific data
const commands = require('./commands.json'); // import bot commands
const util = require('util');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const ytdl = require('ytdl-core');

const queue = new Map();

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, 
                                      Intents.FLAGS.GUILDS, 
                                      Intents.FLAGS.GUILD_VOICE_STATES] }); //create new client

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}!`)
});

/**
 * Usefull functions
 */

function necessary_dirs() {
    if (!fs.existsSync('./data/')) {
        fs.mkdirSync('./data/');
    }
}
necessary_dirs();

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function convert_audio(input) {
    try {
        // stereo to mono channel
        const data = new Int16Array(input)
        const ndata = new Int16Array(data.length/2)
        for (let i = 0, j = 0; i < data.length; i+=4) {
            ndata[j++] = data[i]
            ndata[j++] = data[i+1]
        }
        return Buffer.from(ndata);
    } catch (e) {
        console.log(e)
        console.log('convert_audio: ' + e)
        throw e;
    }
}

async function connect(msg) {
    try {
        if (!msg.member.voice.channel)          return msg.reply("Please connect to a voice channel!");
        if (!msg.member.voice.channel.joinable) return msg.reply("I need permission to join that channel!");

        // Establis voice connection
        const connection = joinVoiceChannel({
            selfDeaf: false,
            channelId: msg.member.voice.channel.id,
            guildId: msg.member.voice.guild.id,
            adapterCreator: msg.member.voice.channel.guild.voiceAdapterCreator,
        });
        speak_impl(msg);
        connection.on("disconnect", async(e) => {
            if (e) console.log(e);
        });
        console.log("Connected");
    } catch (e) {
        console.log('connect: ' + e);
        msg.reply('Error: unable to join your voice channel.')
    }
}

function speak_impl(msg) {
    const connection = getVoiceConnection(msg.guild.id);
    connection.on('speaking', async (user, speaking) => {
        if (speaking.bitfield == 0 || user.bot) return;

        console.log(`I'm listening to ${user.username}`);
        // This creates a 16-bit signed PCM stereo 48KHz stream
        const audioStream = connection.receiver.createStream(user, { mode: 'pcm' });
        audioStream.on('error', (e) => {
            console.log('audioStream: ' + e);
        });
        let buffer = [];
        audioStream.on('data', (data) => {
            buffer.push(data);
        });
        audioStream.on('end', async () => {
            buffer = Buffer.concat(buffer);
            const duration = buffer.length / 48000 / 4;
            console.log("duration: " + duration);

            if (duration < 1.0 || duration > 19) {
                console.log("TOO SHORT / TOO LONG; SKIPPING");
                return;
            }
            try {
                let new_buffer =  await convert_audio(buffer);
                let out = await transcribe(new_buffer);
                if (out != null) 
                    process_commands_query(out, user.id);
            } catch (e) {
                console.log('tmpraw rename: ' + e);
            }
        });
    });
}

function process_commands_query(buffer) {

}

/**
 * Message commands
 */

client.on("messageCreate", async msg => {
    if (!msg.content.startsWith(commands.PREFIX)) return;
    const command = msg.content.replace('+', '');

    const serverQueue = queue.get(msg.guild.id);

    // Join
    if (command.startsWith(commands.JOIN)) {
        await connect(msg);
        return;
    }

    // Leave
    if (command.startsWith(commands.LEAVE)) {
        const connection = getVoiceConnection(msg.guild.id)

        if (!connection) return msg.channel.send("I'm not in a voice channel.");

        connection.destroy();

        console.log("Disconnected from voice!");
        return;
    }

    // Play
    if (command.startsWith(commands.PLAY)) {
        connect(msg);

        execute(msg, serverQueue);
        return;
    }

    // JGL
    if (command.indexOf(commands.JGL) !== -1) {
        console.log("someone typed JGL");
        msg.member.setVoiceChannel(null);
    }

    
});

/**
 * Music handling
 */

async function execute(msg, serverQueue) {
    const args = msg.content.split(" ");
    const songInfo = await ytdl.getInfo(args[1]);
    const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
    };

    if (serverQueue) {
        serverQueue.songs.push(song);
        console.log(serverQueue.songs);
        return msg.channel.send(`${song.title} has been added to the queue!`);
    }

    // creating the contract for our queue
    const queueContract = {
        textChannel: msg.channel,
        voiceChannel: msg.channel.voice,
        connection: null,
        songs: [],
        volume: 5,
        playing: true,
    };
    // setting the queue using our contract
    queue.set(msg.guild.id, queueContract);
    // pushing the song to our songs array
    queueContract.songs.push(song);

    try {
        // here we try to get the voice chat connection
        connection = getVoiceConnection(msg.guild.id);
        queueContract.connection = connection;
        // Calling the play function to start a song
        play(msg.guild, queueContract.songs[0]);
    } catch (e) {
        console.log(e);
        queue.delete(msg.guild.id);
        return msg.channel.send(e);
    }
}

function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        connection = getVoiceConnection(guild.id);
        connection.destroy();
        queue.delete(guild.id);
        return;
    }

    const dispatcher = new PlayerSubscription(serverQueue.connection, ytdl(song.url));
}


/**
 * Voice commands
 */




// make sure this line is the last line
client.login(config.token); // login bot using token