import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@hudak/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import { ScaleLearningHub } from '../components/ScaleLearningHub/ScaleLearningHub'

export const Route = createFileRoute('/scales-quiz')({
  component: ScalesQuizPage,
})

function ScalesQuizPage() {
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
        <ScaleLearningHub />
      </div>
    </div>
  )
}
