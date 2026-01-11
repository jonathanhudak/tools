/**
 * Settings Route - Game configuration and start screen
 */

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@hudak/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { Play, Music2, Settings2, Mic, Piano, Guitar } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchAudioInputDevices } from '../lib/services/audio-devices';
import { Storage } from '../lib/utils/storage';
import type { GameMode } from '../hooks/use-game-round';

export const Route = createFileRoute('/')(
  { component: SettingsRoute }
);

function SettingsRoute() {
  const navigate = useNavigate();

  // Settings state
  const [instrument, setInstrument] = useState('piano');
  const [clef, setClef] = useState('treble');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [tabDisplayMode, setTabDisplayMode] = useState<'staff' | 'tab' | 'both'>('both');
  const [pitchSensitivity, setPitchSensitivity] = useState(10);
  const [pitchSmoothing, setPitchSmoothing] = useState(0.7);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');

  // Load saved settings
  useEffect(() => {
    const settings = Storage.getSettings();
    if (settings.instrument) setInstrument(settings.instrument);
    if (settings.clef) setClef(settings.clef);
    if (settings.gameMode) setGameMode(settings.gameMode as GameMode);
    if (settings.tabDisplayMode) setTabDisplayMode(settings.tabDisplayMode as 'staff' | 'tab' | 'both');

    // Map range to difficulty
    const rangeToDifficulty: Record<string, 'beginner' | 'intermediate' | 'advanced'> = {
      'c4-c5': 'beginner',
      'c4-g5': 'intermediate',
      'a3-c6': 'advanced'
    };
    if (settings.range && rangeToDifficulty[settings.range]) {
      setDifficulty(rangeToDifficulty[settings.range]);
    }
  }, []);

  const isMicrophoneInstrument = instrument === 'violin' || instrument === 'guitar';

  const { data: audioDevices = [] } = useQuery({
    queryKey: ['audio-devices'],
    queryFn: fetchAudioInputDevices,
    enabled: isMicrophoneInstrument,
  });

  useEffect(() => {
    if (audioDevices.length > 0 && !selectedAudioDevice) {
      setSelectedAudioDevice(audioDevices[0].deviceId);
    }
  }, [audioDevices, selectedAudioDevice]);

  const handleStartGame = () => {
    // Save settings
    const difficultyToRange: Record<typeof difficulty, string> = {
      'beginner': 'c4-c5',
      'intermediate': 'c4-g5',
      'advanced': 'a3-c6'
    };
    Storage.saveSettings({
      instrument,
      clef: clef as 'treble' | 'bass',
      range: difficultyToRange[difficulty],
      gameMode,
      tabDisplayMode,
    });

    // Navigate to game with settings as search params
    navigate({
      to: '/play',
      search: {
        instrument,
        clef,
        difficulty,
        gameMode,
        tabDisplayMode,
        pitchSensitivity,
        pitchSmoothing,
        selectedAudioDevice,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-3 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <Music2 className="h-8 w-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Sight Reading Practice
          </h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Master music notation with instant feedback
          </p>
        </div>

        {/* Settings Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Practice Settings</CardTitle>
            </div>
            <CardDescription>Configure your practice session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Instrument Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Instrument</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'piano', label: 'Piano', icon: Piano, desc: 'MIDI' },
                  { id: 'piano-virtual', label: 'Piano', icon: Piano, desc: 'Virtual' },
                  { id: 'violin', label: 'Violin', icon: Mic, desc: 'Mic' },
                  { id: 'guitar', label: 'Guitar', icon: Guitar, desc: 'Mic' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setInstrument(item.id)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      instrument === item.id
                        ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30'
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <item.icon className={`h-6 w-6 mx-auto mb-2 ${
                      instrument === item.id ? 'text-violet-600' : 'text-muted-foreground'
                    }`} />
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Two-column layout for main settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clef */}
              <div className="space-y-2">
                <Label htmlFor="clef">Clef</Label>
                <Select value={clef} onValueChange={setClef}>
                  <SelectTrigger id="clef">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treble">Treble Clef</SelectItem>
                    <SelectItem value="bass">Bass Clef</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as typeof difficulty)}>
                  <SelectTrigger id="difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (C4-C5)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (C4-G5)</SelectItem>
                    <SelectItem value="advanced">Advanced (A3-C6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Game Mode */}
              <div className="space-y-2">
                <Label htmlFor="gameMode">Game Mode</Label>
                <Select value={gameMode} onValueChange={(v) => setGameMode(v as GameMode)}>
                  <SelectTrigger id="gameMode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="practice">Practice (No Timer)</SelectItem>
                    <SelectItem value="timed">Timed Challenge</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tab Display Mode (Guitar only) */}
              {instrument === 'guitar' && (
                <div className="space-y-2">
                  <Label htmlFor="tabDisplayMode">Notation Display</Label>
                  <Select value={tabDisplayMode} onValueChange={(v) => setTabDisplayMode(v as typeof tabDisplayMode)}>
                    <SelectTrigger id="tabDisplayMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Staff + Tab</SelectItem>
                      <SelectItem value="tab">Tablature Only</SelectItem>
                      <SelectItem value="staff">Staff Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Microphone Settings */}
            {isMicrophoneInstrument && (
              <div className="space-y-6 p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Mic className="h-4 w-4" />
                  Microphone Settings
                </div>

                {audioDevices.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="audioDevice">Audio Input</Label>
                    <Select value={selectedAudioDevice} onValueChange={setSelectedAudioDevice}>
                      <SelectTrigger id="audioDevice">
                        <SelectValue placeholder="Select microphone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {audioDevices.map((device) => (
                          <SelectItem key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="pitchSensitivity">Pitch Sensitivity</Label>
                      <span className="text-sm text-muted-foreground">±{pitchSensitivity}¢</span>
                    </div>
                    <input
                      id="pitchSensitivity"
                      type="range"
                      min="3"
                      max="20"
                      value={pitchSensitivity}
                      onChange={(e) => setPitchSensitivity(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Strict</span>
                      <span>Lenient</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="pitchSmoothing">Dial Smoothing</Label>
                      <span className="text-sm text-muted-foreground">{Math.round(pitchSmoothing * 100)}%</span>
                    </div>
                    <input
                      id="pitchSmoothing"
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={pitchSmoothing}
                      onChange={(e) => setPitchSmoothing(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Instant</span>
                      <span>Smooth</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Start Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                onClick={handleStartGame}
                size="lg"
                className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 shadow-lg"
              >
                <Play className="mr-3 h-6 w-6" />
                {gameMode === 'timed' ? 'Start Challenge' : 'Start Practice'}
              </Button>
            </motion.div>

            {/* Game Mode Info */}
            <div className="text-center text-sm text-muted-foreground">
              {gameMode === 'timed' ? (
                <p>Complete notes against the clock with limited lives!</p>
              ) : (
                <p>Practice at your own pace with no time pressure.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
