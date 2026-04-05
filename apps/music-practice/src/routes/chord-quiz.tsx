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

        <ChordLearningHub />
      </div>
    </div>
  )
}
