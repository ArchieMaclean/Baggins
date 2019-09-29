# Run from main.js

import speech_recognition as sr
import wave, sys, os, dotenv, shutil
from pydub import AudioSegment
dotenv.load_dotenv('.env')

try:
	file_name = 'audio_files/'+sys.argv[1]
	current_session = 'audio_files/'+sys.argv[2]
except:
	print('Couldn\'t find audio file')
	sys.exit(1)
try:
	# Speech Recognition wants it as a wav file, so convert to wav
	with open(f'{file_name}.pcm','rb') as pcmfile:
		pcmdata = pcmfile.read()
	with wave.open(f'{file_name}.wav', 'wb') as wavfile:
		wavfile.setparams((2, 2, 44100, 0, 'NONE', 'NONE'))
		wavfile.writeframes(pcmdata)
except:
	print('errorerror')
# Add to current file
infiles = [current_session, file_name+'.wav']
outfile = current_session

if (os.path.isfile(current_session)):
	data= []
	for infile in infiles:
		w = wave.open(infile, 'rb')
		data.append( [w.getparams(), w.readframes(w.getnframes())] )
		w.close()

	with wave.open(outfile, 'wb') as output:
		output.setparams(data[0][0])
		output.writeframes(data[0][1])
		output.writeframes(data[1][1])
else:
	shutil.copyfile(file_name+'.wav',outfile)


	
r = sr.Recognizer()
with sr.AudioFile(f'{file_name}.wav') as source:
	audio = r.record(source)

try:
	print(r.recognize_houndify(audio,os.getenv('CLIENT_ID'),os.getenv('CLIENT_KEY')))
except sr.UnknownValueError as e:
	print("Could not understand audio. {0}".format(str(e)))
except sr.RequestError as e:
	print("Could not request results. {0}".format(str(e)))