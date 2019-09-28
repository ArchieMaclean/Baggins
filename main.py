import speech_rec, os
from dotenv import load_dotenv
import discord
from discord.ext import commands
from discord.opus import load_opus
from discord import VoiceClient

load_opus('/usr/lib/libopusurl.so.0')
load_dotenv('.env')

prefix = "#"
bot = commands.Bot(command_prefix=prefix)


@bot.event
async def on_ready():
    print("Everything's all ready to go~")


@bot.event
async def on_message(message):
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
    await channel.connect()
    await ctx.send('Started')

bot.run(os.getenv('TOKEN'))