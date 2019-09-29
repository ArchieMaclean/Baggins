# Run from main.js

import speech_recognition as sr
import wave, sys, os, dotenv
dotenv.load_dotenv('.env')

try:
	file_name = 'audio_files/'+sys.argv[1]
	#current_session = 'audio_files/'+sys.argv[2]
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
'''
try:
	data = []
	with wave.open(current_session) as cs:
		data.append( [cs.getparams(), cs.readframes(cs.getnframes())] )
		with wave.open(file_name+'.wav') as w:
			data.append( [w.getparams(), w.readframes(w.getnframes())] )

		cs.setparams(data[0][0])
		cs.writeframes(data[0][1])
		cs.writeframes(data[1][1])

	
except e:
	print('Error: '+e)
	sys.exit(1)
'''
r = sr.Recognizer()
with sr.AudioFile(f'{file_name}.wav') as source:
	audio = r.record(source)

try:
	print(r.recognize_houndify(audio,os.getenv('CLIENT_ID'),os.getenv('CLIENT_KEY')))
except sr.UnknownValueError as e:
	print("Could not understand audio. {0}".format(str(e)))
except sr.RequestError as e:
	print("Could not request results. {0}".format(str(e)))