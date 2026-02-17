import { createFileRoute } from '@tanstack/react-router'
import { ScalesModesQuiz } from '../components/ChordScaleGame/ScalesModesQuiz'
import { Button } from '@hudak/ui/components/button'
import { ArrowLeft } from 'lucide-react'

export const Route = createFileRoute('/scales-quiz')({
  component: ScalesQuizPage,
})

function ScalesQuizPage() {
  const navigate = Route.useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: '/' })}
          className="mb-6 text-white border-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="bg-slate-800/50 backdrop-blur rounded-lg p-8 border border-slate-700">
          <h1 className="text-3xl font-bold text-white mb-2">Scales & Modes Quiz</h1>
          <p className="text-slate-300 mb-8">Master scale theory through interactive practice. Toggle between guitar and piano.</p>
          
          <ScalesModesQuiz />
        </div>
      </div>
    </div>
  )
}
