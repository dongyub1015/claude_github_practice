interface Props {
  score: number
}

function HiScore({ score }: Props) {
  return (
    <div className="hi-score">
      {'HI-SCORE  ' + String(score).padStart(6, '0')}
    </div>
  )
}

export default HiScore
