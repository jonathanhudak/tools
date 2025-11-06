import { Music, Settings, Piano, Mic } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@hudak/ui/components/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@hudak/ui/components/select';
import { Label } from '@hudak/ui/components/label';
import { Button } from '@hudak/ui/components/button';
import { Badge } from '@hudak/ui/components/badge';

interface AppSidebarProps {
  instrument: string;
  setInstrument: (value: string) => void;
  clef: string;
  setClef: (value: string) => void;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  setDifficulty: (value: 'beginner' | 'intermediate' | 'advanced') => void;
  midiConnected: boolean;
  midiDevices: any[];
  micConnected: boolean;
  connectMicrophone: () => void;
  requiresMIDI: boolean;
  requiresMicrophone: boolean;
  onSaveSettings: (settings: any) => void;
}

export function AppSidebar({
  instrument,
  setInstrument,
  clef,
  setClef,
  difficulty,
  setDifficulty,
  midiConnected,
  midiDevices,
  micConnected,
  connectMicrophone,
  requiresMIDI,
  requiresMicrophone,
  onSaveSettings,
}: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Music className="h-5 w-5 text-primary" />
          <span className="font-semibold">Practice Settings</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Instrument</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <Select
                value={instrument}
                onValueChange={(value) => {
                  setInstrument(value);
                  onSaveSettings({ instrument: value });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="piano">🎹 Piano (MIDI)</SelectItem>
                  <SelectItem value="violin">🎻 Violin (Microphone)</SelectItem>
                  <SelectItem value="guitar">🎸 Guitar (Microphone)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {requiresMIDI && (
          <SidebarGroup>
            <SidebarGroupLabel>MIDI Device</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Piano className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {midiConnected ? 'Device connected' : 'No device detected'}
                  </span>
                </div>
                <Select disabled={!midiConnected}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={midiConnected ? "Device connected" : "No device"} />
                  </SelectTrigger>
                  <SelectContent>
                    {midiDevices.map((device, i) => (
                      <SelectItem key={i} value={device.id}>
                        {device.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {requiresMicrophone && (
          <SidebarGroup>
            <SidebarGroupLabel>Microphone</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  <span className="text-sm text-muted-foreground">
                    {micConnected ? 'Microphone active' : 'Connect to start'}
                  </span>
                </div>
                <Button
                  onClick={connectMicrophone}
                  className="w-full"
                  disabled={micConnected}
                  variant={micConnected ? "secondary" : "default"}
                  size="sm"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  {micConnected ? 'Connected' : 'Connect Microphone'}
                </Button>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Practice Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2 py-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clef-select" className="text-sm">Clef</Label>
                <Select
                  value={clef}
                  onValueChange={(value) => {
                    setClef(value);
                    onSaveSettings({ clef: value });
                  }}
                >
                  <SelectTrigger id="clef-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treble">Treble</SelectItem>
                    <SelectItem value="bass">Bass</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty-select" className="text-sm">Difficulty</Label>
                <Select
                  value={difficulty}
                  onValueChange={(value: any) => {
                    setDifficulty(value);
                    const difficultyToRange: Record<typeof difficulty, string> = {
                      'beginner': 'c4-c5',
                      'intermediate': 'c4-g5',
                      'advanced': 'a3-c6'
                    };
                    onSaveSettings({ range: difficultyToRange[value] });
                  }}
                >
                  <SelectTrigger id="difficulty-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (C4-C5)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (C4-G5)</SelectItem>
                    <SelectItem value="advanced">Advanced (A3-C6)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
