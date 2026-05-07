import MenuItem from './MenuItem.tsx'

interface Props {
  items: string[]
  selectedIndex: number
  onClickItem: (index: number) => void
  onHoverItem: (index: number) => void
}

function MenuList({ items, selectedIndex, onClickItem, onHoverItem }: Props) {
  return (
    <div className="menu-list">
      {items.map((item, index) => (
        <MenuItem
          key={item}
          label={item}
          isSelected={index === selectedIndex}
          onClick={() => onClickItem(index)}
          onMouseEnter={() => onHoverItem(index)}
        />
      ))}
    </div>
  )
}

export default MenuList
