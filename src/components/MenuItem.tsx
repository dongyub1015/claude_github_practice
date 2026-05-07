interface Props {
  label: string
  isSelected: boolean
  onClick: () => void
  onMouseEnter: () => void
}

function MenuItem({ label, isSelected, onClick, onMouseEnter }: Props) {
  return (
    <div
      className={`menu-item${isSelected ? ' selected' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <span className="cursor">{isSelected ? '▶' : ' '}</span>
      {label}
    </div>
  )
}

export default MenuItem
