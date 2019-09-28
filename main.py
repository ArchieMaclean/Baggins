# OLD

import speech_rec, os
from dotenv import load_dotenv
import discord
from discord import *
from discord.ext import commands
from discord.opus import load_opus


# Setup

load_opus('/usr/lib/libopusurl.so.0')
load_dotenv('.env')

prefix = "#"
bot = commands.Bot(command_prefix=prefix)

current_voice_channels = []

def log_channel():
    log_channel = bot.get_channel(discord.utils.get(bot.get_all_channels(),name='log').id)
    print(log_channel)
    return log_channel

async def log_text(text):
    await log_channel().send(text)


@bot.event
async def on_ready():
    print("Everything's all ready to go~")


@bot.event
async def on_message(message):
    if (message.author.id != bot.user.id):
        await log_text(message.content)
    print("The message's content was", message.content)
    await bot.process_commands(message)


@bot.command()
async def start(ctx):
    '''
    Start a voice channel. You should be in the channel you want the bot to connect to.
    '''
    user_voice = ctx.message.author.voice
    if not user_voice:
        await ctx.send('You must be in a voice channel to run this command.')
        return;
    channel = bot.get_channel(user_voice.channel.id)
    vc = await channel.connect()
    channel.listen()
    current_voice_channels.append(vc)
    await ctx.send('Started')


@bot.command()
async def stop(ctx):
    '''
    Quit from all current voice channels.
    '''
    for vc in current_voice_channels:
        await vc.disconnect()


bot.run(os.getenv('TOKEN'))