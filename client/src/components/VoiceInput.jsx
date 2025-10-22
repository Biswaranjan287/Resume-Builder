import React, { useEffect, useRef, useState } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

/*
 Props:
  - onTranscript(text)         // interim & final (live)
  - onFinalTranscript(text)    // called when final chunk arrives
  - focusedField               // optional string (for debug UI)
*/
const VoiceInput = ({ onTranscript, onFinalTranscript, focusedField }) => {
    const [listening, setListening] = useState(false)
    const { interimTranscript, finalTranscript, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition()
    const startedRef = useRef(false)

    useEffect(() => {
        console.log('[VoiceInput] supportsSpeech:', browserSupportsSpeechRecognition)
    }, [browserSupportsSpeechRecognition])

    useEffect(() => {
        if (interimTranscript) {
            // console.log('🎧 interimTranscript:', interimTranscript)
            onTranscript && onTranscript(interimTranscript)
        }
    }, [interimTranscript, onTranscript])

    useEffect(() => {
        if (finalTranscript) {
            // console.log('✅ finalTranscript:', finalTranscript)
            onTranscript && onTranscript(finalTranscript)
            onFinalTranscript && onFinalTranscript(finalTranscript)
            resetTranscript()
        }
    }, [finalTranscript, onTranscript, onFinalTranscript, resetTranscript])

    // const startListening = () => {
    //     if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
    //         console.error('[VoiceInput] No Web Speech API available in this browser.')
    //         return
    //     }
    //     resetTranscript()
    //     SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
    //     setListening(true)
    //     startedRef.current = true
    //     console.log('[VoiceInput] started, focusedField:', focusedField || 'none')
    // }
    const startListening = async () => {
        if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
            console.error('[VoiceInput] No Web Speech API available in this browser.');
            alert('Voice input is not supported in this browser. Please use Chrome/Edge on HTTPS.');
            return;
        }

        if (!window.isSecureContext) {
            console.error('[VoiceInput] Not in secure context (HTTPS).');
            alert('Voice input requires HTTPS. Please open the site with https://');
            return;
        }

        try {
            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(t => t.stop()); // stop after permission granted
        } catch (err) {
            console.error('Mic permission blocked or denied', err);
            alert('Please allow microphone access for voice input.');
            return;
        }

        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'en-IN' });
        setListening(true);
        startedRef.current = true;
        console.log('[VoiceInput] started, focusedField:', focusedField || 'none');
    };


    const stopListening = () => {
        SpeechRecognition.stopListening()
        setListening(false)
        startedRef.current = false
        console.log('[VoiceInput] stopped')
    }

    if (!browserSupportsSpeechRecognition) {
        return <div className="text-sm text-red-600">Voice not supported — use Chrome/Edge on localhost or HTTPS.</div>
    }

    if (!window.isSecureContext) {
        return (
            <div className="text-sm text-red-600">
                Voice input requires HTTPS. Please open the site with https://
            </div>
        )
    }


    return (
        <div className="flex items-center gap-3 mt-4">
            {!listening ? (
                <button
                    onClick={startListening}
                    className="px-6 py-2 text-sm ring-purple-300 ring hover:ring-purple-400 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50"
                >🎙️ Start Voice Input
                </button>
            ) : (
                <button
                    onClick={stopListening}
                    className="px-6 py-2 text-sm ring-red-300 ring hover:ring-red-400 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors disabled:opacity-50"
                >⏹️ Stop Listening
                </button>
            )}
            {/* <div className="text-xs text-slate-600">
                <div>status: {listening ? 'listening' : 'idle'}</div>
                <div>focused: {focusedField || 'none'}</div>
            </div> */}
        </div>
    )
}

export default VoiceInput
