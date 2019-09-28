import speech_rec, os
from dotenv import load_dotenv
from discord.ext import commands
from discord.opus import load_opus

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
    This text will be shown in the help command
    '''
    await ctx.send('Started')

bot.run(os.getenv('TOKEN'))