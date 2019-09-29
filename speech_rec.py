# Run from main.js

import speech_recognition as sr
import wave, sys, os

try:
	file_name = sys.argv[1]
except:
	print('Couldn\'t find audio file')
	sys.exit(1)

# Speech Recognition wants it as a wav file, so convert to wav
with open(f'{file_name}.pcm','rb') as pcmfile:
	pcmdata = pcmfile.read()
with wave.open(f'{file_name}.wav', 'wb') as wavfile:
	wavfile.setparams((2, 2, 44100, 0, 'NONE', 'NONE'))
	wavfile.writeframes(pcmdata)

r = sr.Recognizer()
with sr.AudioFile(f'{file_name}.wav') as source:
	audio = r.record(source)


try:
	print(r.recognize_google(audio))
except sr.UnknownValueError as e:
	print("Could not understand audio. {0}".format(str(e)))
except sr.RequestError as e:
	print("Could not request results. {0}".format(str(e)))