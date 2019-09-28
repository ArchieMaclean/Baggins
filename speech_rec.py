import speech_recognition as sr
class SpeechRec:
	def __init__(self):
		r = sr.Recognizer()
		with sr.AudioFile('untitled.wav') as source:
			audio = r.record(source)

		try:
			print("You said " + r.recognize_google(audio))
		except sr.UnknownValueError:
			print("Could not understand audio")
		except sr.RequestError as e:
			print("Could not request results; {0}".format(e))