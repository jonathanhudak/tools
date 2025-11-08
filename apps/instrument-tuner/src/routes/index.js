import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Note } from 'tonal';
import { toast } from 'sonner';
import { PitchGauge } from '@hudak/audio-components';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui';
import { Button } from '@hudak/ui';
import { Badge } from '@hudak/ui';
import { Label } from '@hudak/ui';
import { Music, Mic, MicOff, Settings as SettingsIcon } from 'lucide-react';
// Audio detection (we'll create this utility)
import { AudioManager } from '../utils/audio-manager';
export const Route = createFileRoute('/')({
    component: TunerPage,
});
// Standard guitar tuning (low to high)
const GUITAR_TUNINGS = {
    standard: [
        { note: 'E2', name: 'E', string: 6, frequency: 82.41 },
        { note: 'A2', name: 'A', string: 5, frequency: 110.00 },
        { note: 'D3', name: 'D', string: 4, frequency: 146.83 },
        { note: 'G3', name: 'G', string: 3, frequency: 196.00 },
        { note: 'B3', name: 'B', string: 2, frequency: 246.94 },
        { note: 'E4', name: 'E', string: 1, frequency: 329.63 },
    ],
    dropD: [
        { note: 'D2', name: 'D', string: 6, frequency: 73.42 },
        { note: 'A2', name: 'A', string: 5, frequency: 110.00 },
        { note: 'D3', name: 'D', string: 4, frequency: 146.83 },
        { note: 'G3', name: 'G', string: 3, frequency: 196.00 },
        { note: 'B3', name: 'B', string: 2, frequency: 246.94 },
        { note: 'E4', name: 'E', string: 1, frequency: 329.63 },
    ],
};
function TunerPage() {
    // State
    const [microphoneActive, setMicrophoneActive] = useState(false);
    const [detectedPitch, setDetectedPitch] = useState(null);
    const [selectedTuning, setSelectedTuning] = useState('standard');
    const [pitchSensitivity, setPitchSensitivity] = useState(10);
    const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
    const [showSettings, setShowSettings] = useState(false);
    const [autoDetectString, setAutoDetectString] = useState(true);
    const [highlightedString, setHighlightedString] = useState(null);
    // Refs
    const audioManager = useRef(null);
    const audioInitAttemptedRef = useRef(false);
    // Get current tuning
    const currentTuning = GUITAR_TUNINGS[selectedTuning];
    // Handle pitch detection
    const handlePitchDetected = useCallback((event) => {
        const { frequency, clarity } = event;
        // Get note info
        const noteInfo = Note.fromFreq(frequency);
        const noteName = noteInfo || 'Unknown';
        // Calculate cents deviation
        const midiNumber = Note.midi(noteName);
        if (midiNumber === null)
            return;
        const expectedFreq = Note.freq(noteName);
        if (!expectedFreq)
            return;
        const cents = 1200 * Math.log2(frequency / expectedFreq);
        setDetectedPitch({
            note: noteName,
            cents: Math.round(cents * 10) / 10,
            frequency,
            clarity,
        });
        // Auto-detect which string is being played
        if (autoDetectString) {
            const closestString = currentTuning.reduce((closest, tuning) => {
                const diff = Math.abs(frequency - tuning.frequency);
                const closestDiff = Math.abs(frequency - closest.frequency);
                return diff < closestDiff ? tuning : closest;
            });
            // Only highlight if within reasonable range (within 50 cents / ~3% frequency difference)
            const freqDiff = Math.abs(frequency - closestString.frequency);
            const percentDiff = freqDiff / closestString.frequency;
            if (percentDiff < 0.03) {
                setHighlightedString(closestString.string);
            }
            else {
                setHighlightedString(null);
            }
        }
    }, [autoDetectString, currentTuning]);
    // Initialize audio on mount
    useEffect(() => {
        if (audioInitAttemptedRef.current)
            return;
        const initAudio = async () => {
            audioInitAttemptedRef.current = true;
            audioManager.current = new AudioManager();
            const success = await audioManager.current.init();
            setMicrophoneActive(success);
            if (success) {
                audioManager.current.on('pitchDetected', handlePitchDetected);
                audioManager.current.on('statusChange', (status) => {
                    setMicrophoneActive(status.microphoneActive);
                });
                audioManager.current.startListening();
                toast.success('Microphone connected', {
                    description: 'Start playing to tune your instrument',
                });
            }
            else {
                toast.error('Microphone Access Required', {
                    description: 'Click the camera/microphone icon in your browser\'s address bar to allow microphone access, then reload the page.',
                    duration: 10000,
                });
            }
        };
        initAudio();
        return () => {
            audioManager.current?.disconnect();
        };
    }, [handlePitchDetected]);
    // Toggle microphone
    const toggleMicrophone = () => {
        if (microphoneActive) {
            audioManager.current?.stopListening();
            setMicrophoneActive(false);
        }
        else {
            audioManager.current?.startListening();
            setMicrophoneActive(true);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800", children: _jsxs("div", { className: "container mx-auto p-6 space-y-6 max-w-4xl", children: [_jsxs("div", { className: "text-center space-y-2 pt-6", children: [_jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx(Music, { className: "h-10 w-10 text-primary" }), _jsx("h1", { className: "text-4xl font-bold", children: "Instrument Tuner" })] }), _jsx("p", { className: "text-muted-foreground text-lg", children: "Free online tuner with real-time pitch detection" })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { onClick: toggleMicrophone, variant: microphoneActive ? 'default' : 'outline', size: "lg", className: "gap-2", children: microphoneActive ? (_jsxs(_Fragment, { children: [_jsx(Mic, { className: "h-5 w-5" }), "Microphone Active"] })) : (_jsxs(_Fragment, { children: [_jsx(MicOff, { className: "h-5 w-5" }), "Microphone Off"] })) }) }), _jsx("div", { className: "flex justify-center", children: _jsxs(Button, { onClick: () => setShowSettings(!showSettings), variant: "ghost", size: "sm", className: "gap-2", children: [_jsx(SettingsIcon, { className: "h-4 w-4" }), showSettings ? 'Hide' : 'Show', " Settings"] }) }), showSettings && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tuner Settings" }), _jsx(CardDescription, { children: "Customize sensitivity and tuning" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tuning" }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: selectedTuning === 'standard' ? 'default' : 'outline', onClick: () => setSelectedTuning('standard'), children: "Standard (E A D G B E)" }), _jsx(Button, { variant: selectedTuning === 'dropD' ? 'default' : 'outline', onClick: () => setSelectedTuning('dropD'), children: "Drop D (D A D G B E)" })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { htmlFor: "auto-detect", children: "Auto-detect string" }), _jsx("input", { id: "auto-detect", type: "checkbox", checked: autoDetectString, onChange: (e) => setAutoDetectString(e.target.checked), className: "h-4 w-4" })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { htmlFor: "pitch-sensitivity", children: "Pitch Sensitivity" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["\u00B1", pitchSensitivity, " cents"] })] }), _jsx("input", { id: "pitch-sensitivity", type: "range", min: "3", max: "20", step: "1", value: pitchSensitivity, onChange: (e) => setPitchSensitivity(Number(e.target.value)), className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "More Strict (3\u00A2)" }), _jsx("span", { children: "More Lenient (20\u00A2)" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { htmlFor: "pitch-smoothing", children: "Dial Smoothing" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [Math.round(pitchSmoothing * 100), "%"] })] }), _jsx("input", { id: "pitch-smoothing", type: "range", min: "0", max: "1", step: "0.05", value: pitchSmoothing, onChange: (e) => setPitchSmoothing(Number(e.target.value)), className: "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsx("span", { children: "Instant (0%)" }), _jsx("span", { children: "Very Smooth (100%)" })] })] })] })] })), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Guitar Strings" }), _jsx(CardDescription, { children: selectedTuning === 'standard' ? 'Standard Tuning' : 'Drop D Tuning' })] }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-6 gap-3", children: currentTuning.map((tuning) => {
                                    const isHighlighted = highlightedString === tuning.string;
                                    const isInTune = detectedPitch &&
                                        isHighlighted &&
                                        Math.abs(detectedPitch.cents) <= pitchSensitivity;
                                    return (_jsxs("div", { className: `p-4 rounded-lg border-2 text-center transition-all ${isHighlighted
                                            ? isInTune
                                                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                                                : 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                                            : 'border-gray-200 dark:border-gray-700'}`, children: [_jsxs("div", { className: "text-xs text-muted-foreground mb-1", children: ["String ", tuning.string] }), _jsx("div", { className: "text-3xl font-bold", children: tuning.name }), _jsx("div", { className: "text-xs text-muted-foreground mt-1", children: tuning.note }), isHighlighted && detectedPitch && (_jsxs(Badge, { variant: isInTune ? 'default' : 'secondary', className: "mt-2 text-xs", children: [detectedPitch.cents > 0 ? '+' : '', detectedPitch.cents.toFixed(0), "\u00A2"] }))] }, tuning.string));
                                }) }) })] }), detectedPitch && (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Live Tuner" }), _jsx(CardDescription, { children: "Play a string to see real-time tuning feedback" })] }), _jsx(CardContent, { className: "flex justify-center", children: _jsx(PitchGauge, { note: detectedPitch.note, cents: detectedPitch.cents, clarity: detectedPitch.clarity, inTuneThreshold: pitchSensitivity, smoothingFactor: pitchSmoothing }) })] })), !detectedPitch && microphoneActive && (_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "text-center space-y-2", children: [_jsx(Music, { className: "h-12 w-12 text-muted-foreground mx-auto" }), _jsx("p", { className: "text-muted-foreground", children: "Play any string on your guitar to start tuning" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "The tuner will automatically detect which string you're playing" })] }) }) }))] }) }));
}
//# sourceMappingURL=index.js.map