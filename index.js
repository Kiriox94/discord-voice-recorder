const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { VoiceConnectionStatus, EndBehaviorType, NoSubscriberBehavior, joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const prism = require('prism-media');

const fs = require('fs');
const { pipeline } = require('node:stream');

const { token, targetId } = require("./config.json")

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildVoiceStates
    ] 
});

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Pause,
	},
});

var connection
var opusStream

const playWarning = true

if (!fs.existsSync("./recordings")) fs.mkdirSync("./recordings")

client.once(Events.ClientReady, async c => {
    console.log(`Ready! Logged in as ${c.user.tag}`);

    let user = await client.users.fetch(targetId).catch(console.error);
    client.user.setPresence({
        activities: [{
            name: user.displayName,
            type: ActivityType.Listening
        }],
        status: 'idle'
    });

    client.guilds.cache.forEach((guild) => {
        const member = guild.members.cache.get(targetId);
        if (member) {
          const voiceState = guild.voiceStates.cache.get(targetId);
          if (voiceState && voiceState.channel) {
            connectAndRecord(voiceState.channel);
          }
        }
    })
});

client.on('voiceStateUpdate', (oldState, newState) => {
    if (newState.member.id == targetId) {
        let channel = newState.channel
        if (channel != null) {
            if (oldState.channel != null) {
                if (connection != null) connection.destroy();
                if (opusStream != null) opusStream.emit("end");
            }else{
                connectAndRecord(channel)
            }
        } else {
            if (connection != null) connection.destroy();
            if (opusStream != null) opusStream.emit("end");
            client.user.setPresence({ status: 'idle' });
        }
    }
});

function connectAndRecord(channel){
    connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        selfDeaf: false,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on(VoiceConnectionStatus.Ready, (oldState, newState) => {
        let receiver = connection.receiver;
        createListeningStream(receiver, targetId);
        
        if(playWarning){
            let warningSound = createAudioResource('./warning.mp3');
            connection.subscribe(player)

            player.play(warningSound)
        }
    });

    client.user.setPresence({ status: 'online' });
}

function createListeningStream(receiver, userId) {
    opusStream = receiver.subscribe(userId, {
        end: {
            behavior: EndBehaviorType.Manual
        },
    });

    let oggStream = new prism.opus.OggLogicalBitstream({
        opusHead: new prism.opus.OpusHead({
            channelCount: 2,
            sampleRate: 48000,
        }),
        pageSizeControl: {
            maxPackets: 10,
        },
    });

    let filename = `./recordings/${Date.now()}.ogg`;

    let out = fs.createWriteStream(filename);

    console.log(`👂 Started recording ${filename}`);

    pipeline(opusStream, oggStream, out, (err) => {
        if (err) {
            console.warn(`❌ Error recording file ${filename} - ${err.message}`);
        } else {
            console.log(`✅ Recorded ${filename}`);
        }
    });
}

// Log in to Discord with your client's token
client.login(token);