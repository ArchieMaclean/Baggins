# OLD (probably)

import speech_recognition as sr
import wave

# Speech Recognition wants it as a wav file, so convert
with open('data.pcm', 'rb') as pcmfile:
	pcmdata = pcmfile.read()
with wave.open('data.wav', 'wb') as wavfile:
	wavfile.setparams((2, 2, 44100, 0, 'NONE', 'NONE'))
	wavfile.writeframes(pcmdata)

r = sr.Recognizer()
with sr.AudioFile('data.wav') as source:
	audio = r.record(source)

try:
	print("You said " + r.recognize_google(audio))
except sr.UnknownValueError:
	print("Could not understand audio")
except sr.RequestError as e:
	print("Could not request results; {0}".format(e))
