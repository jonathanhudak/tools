import { createFileRoute } from '@tanstack/react-router'
import { ChordLearningHub } from '../components/ChordLearningHub/ChordLearningHub'
import { Button } from '@hudak/ui/components/button'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/chord-quiz')({
  component: ChordQuizPage,
})

function ChordQuizPage() {
  const navigate = Route.useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="bg-card backdrop-blur rounded-lg p-8 border border-border">
          <h1 className="text-3xl font-bold font-display text-foreground mb-2">Chord Learning & Quiz</h1>
          <p className="text-muted-foreground mb-8">Learn and practice chords with visual reference and interactive quizzes. Toggle between guitar and piano.</p>
          
          <ChordLearningHub />
        </div>
      </div>
    </div>
  )
}
