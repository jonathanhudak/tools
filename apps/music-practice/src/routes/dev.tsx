import { createFileRoute, Navigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@hudak/ui/components/card';
import { StaffDisplay } from '../components/notation/StaffDisplay';
import { TabDisplay } from '../components/notation/TabDisplay';
import { FallingNotesDisplay } from '../components/notation/FallingNotesDisplay';

export const Route = createFileRoute('/dev')({
  component: DevRoute,
});

function DevRoute() {
  if (!import.meta.env.DEV) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-display font-bold">Dev: Notation Renderers</h1>

      {/* Staff Renderers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Staff Renderer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Single Note: C4</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffDisplay note="c/4" clef="treble" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Single Note: F#4</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffDisplay note="f#/4" clef="treble" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Bass Clef: F3, C3</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffDisplay notes={['f/3', 'c/3']} clef="bass" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">C Major Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffDisplay notes={['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5']} clef="treble" />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Tab Renderers */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Tab Renderer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Open E String (MIDI 40)</CardTitle>
            </CardHeader>
            <CardContent>
              <TabDisplay midiNote={40} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">High Fret (MIDI 64)</CardTitle>
            </CardHeader>
            <CardContent>
              <TabDisplay midiNote={64} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Staff + Tab Combined (MIDI 60)</CardTitle>
            </CardHeader>
            <CardContent>
              <TabDisplay midiNote={60} showStaff />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Open Strings Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <TabDisplay midiNotes={[40, 45, 50, 55, 59, 64]} />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Falling Notes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Falling Notes Renderer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Note Mid-Fall (MIDI 60)</CardTitle>
            </CardHeader>
            <CardContent>
              <FallingNotesDisplay midiNote={60} noteName="C4" speed={2} className="h-[400px]" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-mono-app">Fast Speed (MIDI 67)</CardTitle>
            </CardHeader>
            <CardContent>
              <FallingNotesDisplay midiNote={67} noteName="G4" speed={4} className="h-[400px]" />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
