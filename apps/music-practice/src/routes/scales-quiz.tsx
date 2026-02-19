import { createFileRoute } from '@tanstack/react-router'
import { ScaleLearningHub } from '../components/ScaleLearningHub/ScaleLearningHub'

export const Route = createFileRoute('/scales-quiz')({
  component: ScalesQuizPage,
})

function ScalesQuizPage() {
  return <ScaleLearningHub />
}
