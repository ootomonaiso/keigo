interface MenuSectionProps {
  currentSection: string
  setCurrentSection: (section: string) => void
}

export function MenuSection({ currentSection, setCurrentSection }: MenuSectionProps) {
  const menuItems = [
    { id: 'home', label: 'ホーム', icon: '🏠' },
    { id: 'chat', label: 'チャット練習', icon: '💬' },
    { id: 'lessons', label: '敬語レッスン', icon: '📚' },
    { id: 'progress', label: '学習進捗', icon: '📊' }
  ]

  return (
    <nav className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentSection(item.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentSection === item.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
