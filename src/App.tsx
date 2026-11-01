// @ts-nocheck
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react'

type ChecklistCategory = 'water' | 'light' | 'documents' | 'clothing'

interface ChecklistItem {
  id: string
  text: string
  category: ChecklistCategory
  completed: boolean
  quantity: string | undefined
  note: string | undefined
}

type ContactsData = {
  id: string
  name: string
  phone: string
  note: string | undefined
}[]

interface AppSettings {
  meetingAddress: string
  personalNotes: string
}

// SVG Icon components unified in style
const WaterIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <path d="M13 2H6a2 2 0 0 0-2 2v3h2V6h5l2 4h2l2-4h5v3a2 2 0 0 0 2-2zm2 7h-2v2h2v-2zm4-5h-3v2h3v-2zm0 5h-3v2h3v-2zm2-7v2h2v-2h-2zm-6 7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM13 2a1 1 0 0 0-1 1v3h2V6h5l2 4h2l2-4h5v3a1 1 0 0 0 1 1zm2 7h-2v2h2v-2zm4-5h-3v2h3v-2zm0 5h-3v2h3v-2zm2-7v2h2v-2h-2zm6 7c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm3.5 3c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM13 2a1 1 0 0 0-1 1v3h2V6h5l2 4h2l2-4h5v3a1 1 0 0 0 1 1zm2 7h-2v2h2v-2zm4-5h-3v2h3v-2zm0 5h-3v2h3v-2zm2-7v2h2v-2h-2z" />
    <circle cx="9" cy="6" r="2" />
    <path d="M3 3v2h2V3H3zm4 0v2h2V3H7zm4 0v2h2V3H7zm4 0v2h2v-3h-2zm-6 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm0 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm0 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm10-4h-2v2h2v-2h-2zm0 4h-2v2h2v-2h-2zm0 4h-2v2h2v-2h-2zm2 2h2v2h-2v-2h-2zm0-6h2v2h-2v-2h-2zm4 4v2h2v-2h-2zm-4 4v-2h-2v2h-2zm0-6v-2h-2v2h-2zm4 0v2h2v-2h-2zm-4-4v-2h-2v2h-2zm0-4v-2h-2v2h-2zm6-2h-2v2h2v-2zm4 4v-2h-2v2h-2zm-6-4v2h-2v2h2v-2zm0-4v2h-2v2h2v-2z" />
  </svg>
)

const LightIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <path d="M12 2v6h4v12h-6v-4h-2v-4zm5-12h-5l-3 9 3 5 4-6h4L14 5z" />
    <path d="M13 2H6a2 2 0 0 0-2 2v3h2V6h5l2 4h2l2-4h5v3a2 2 0 0 0 2-2zm2 7h-2v2h2v-2zm4-5h-3v2h3v-2zm0 5h-3v2h3v-2zm2-7v2h2v-2h-2z" />
  </svg>
)

const DocumentsIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
    <path d="M14 2H6a2 2 0 0 0-2 2v16l4-1 1-4h2v-10.5l-2.5 1.5L12 5.5l2.5 1.5L18 10.5l4-1V4a2 2 0 0 0-2-2zM18 4h2v2h-2V4zm0 3h2v3h-2V7zm0 5h2v2h-2v-2z" />
  </svg>
)

const ClothingIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <path d="M3 3v2h2V3H3zm4 0v2h2V3H7zm4 0v2h2V3H7zm4 0v2h2v-3h-2zm-6 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm0 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm0 4c-1.1 0-2 .9-2 2v2h2v-2h-2v-2h2v2zm10-4h-2v2h2v-2h-2zm0 4h-2v2h2v-2h-2zm0 4h-2v2h2v-2h-2zm2 2h2v2h-2v-2h-2zm0-6h2v2h-2v-2h-2zm4 4v2h2v-2h-2zm-4 4v-2h-2v2h-2zm0-6v-2h-2v2h-2zm4 0v2h2v-2h-2zm-4-4v-2h-2v2h-2zm6-2h-2v2h2v-2zm4 4v-2h-2v2h-2zm-6-4v2h-2v2h2v-2zm0-4v2h-2v2h2v-2z" />
  </svg>
)

const categoryEmoji: Record<ChecklistCategory, string> = {
  water: '💧',
  light: '🔦',
  documents: '📄',
  clothing: '👕',
}

const INITIAL_ITEMS: Record<ChecklistCategory, ChecklistItem[]> = {
  water: [],
  light: [],
  documents: [],
  clothing: [],
}

const INITIAL_CONTACTS: ContactsData = []
const INITIAL_SETTINGS: AppSettings = {
  meetingAddress: '',
  personalNotes: '',
}

const loadFromLocalStorage = (key: string, defaultValue: any) => {
  try {
    const serialized = localStorage.getItem(key)
    return serialized ? JSON.parse(serialized) : defaultValue
  } catch {
    return defaultValue
  }
}

const saveToLocalStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function App() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    loadFromLocalStorage('safekit-checklist', [
      ...INITIAL_ITEMS.water,
      ...INITIAL_ITEMS.light,
      ...INITIAL_ITEMS.documents,
      ...INITIAL_ITEMS.clothing,
    ])
  )
  const [categories] = useState<ChecklistCategory[]>(['water', 'light', 'documents', 'clothing'])
  const [contacts, setContacts] = useState<ContactsData>(() =>
    loadFromLocalStorage('safekit-contacts', [])
  )
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromLocalStorage('safekit-settings', INITIAL_SETTINGS)
  )
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [newItemText, setNewItemText] = useState('')
  const [newItemCategory, setNewItemCategory] = useState<ChecklistCategory>('water')
  const [newItemQuantity, setNewItemQuantity] = useState('')
  const [newItemNote, setNewItemNote] = useState('')
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')
  const [newContactNote, setNewContactNote] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const totalItems = checklist.length
  const completedItems = checklist.filter((item) => item.completed).length
  const readinessPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

  useEffect(() => {
    saveToLocalStorage('safekit-checklist', checklist)
    saveToLocalStorage('safekit-contacts', contacts)
    saveToLocalStorage('safekit-settings', settings)
  }, [checklist, contacts, settings])

  const handleAddItem = useCallback(() => {
    if (!newItemText.trim()) return
    const newItem: ChecklistItem = {
      id: uuidv4(),
      text: newItemText.trim(),
      category: newItemCategory,
      completed: false,
      quantity: newItemQuantity ? newItemQuantity.trim() : undefined,
      note: newItemNote.trim() || undefined,
    }
    setChecklist((prev) => [...prev, newItem])
    setNewItemText('')
    setNewItemQuantity('')
    setNewItemNote('')
  }, [newItemText, newItemCategory, newItemQuantity, newItemNote])

  const handleToggleComplete = useCallback((id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }, [])

  const handleEditItem = useCallback((item: ChecklistItem) => {
    setEditingItem(item)
    setNewItemText(item.text)
    setNewItemCategory(item.category)
    setNewItemQuantity(item.quantity || '')
    setNewItemNote(item.note || '')
  }, [])

  const handleSaveEdited = useCallback(() => {
    if (!editingItem || !newItemText.trim()) return
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              text: newItemText.trim(),
              category: newItemCategory,
              quantity: newItemQuantity.trim() || undefined,
              note: newItemNote.trim() || undefined,
            }
          : item
      )
    )
    setEditingItem(null)
    setNewItemText('')
    setNewItemCategory('water')
    setNewItemQuantity('')
    setNewItemNote('')
  }, [editingItem, newItemText, newItemCategory, newItemQuantity, newItemNote])

  const handleDeleteItem = useCallback((id: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const handleDeleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handleAddContact = useCallback(() => {
    if (!newContactName.trim() || !newContactPhone.trim()) return
    const newContact: ContactsData[0] = {
      id: uuidv4(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      note: newContactNote.trim() || undefined,
    }
    setContacts((prev) => [...prev, newContact])
    setNewContactName('')
    setNewContactPhone('')
    setNewContactNote('')
  }, [newContactName, newContactPhone, newContactNote])

  const handleDeleteAllData = useCallback(() => {
    setShowDeleteConfirm(true)
  }, [])

  const confirmDeleteAll = useCallback(() => {
    setContacts(INITIAL_CONTACTS)
    setChecklist([
      ...INITIAL_ITEMS.water,
      ...INITIAL_ITEMS.light,
      ...INITIAL_ITEMS.documents,
      ...INITIAL_ITEMS.clothing,
    ])
    setSettings(INITIAL_SETTINGS)
    setShowDeleteConfirm(false)
  }, [])

  const exportData = useCallback(() => {
    const data = {
      checklist,
      contacts,
      settings,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'safekit-plan.json'
    a.click()
    URL.revokeObjectURL(url)
    return data
  }, [checklist, contacts, settings])

  const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r % 8) + 0x4
      return v.toString(16)
    })
  }

  return (
    <div
      data-theme={theme}
      style={{
        minHeight: '100vh',
        background: theme === 'dark' ? '#0B0F14' : '#F5F1E8',
        color: theme === 'dark' ? '#EAF2F8' : '#1e293b',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <header
        style={{
          padding: '20px 24px',
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>SafeKit</h1>
        <div
          style={{
            marginLeft: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: '12px',
              color: '#64748b',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            aria-label='Сменить тему'
          >
            <span style={{ fontSize: '20px' }}>{theme === 'dark' ? '🌞' : '🌙'}</span>
          </button>
        </div>
        <p
          style={{
            margin: '8px 0 0 0',
            fontSize: '14px',
            color: '#64748b',
          }}
        >
          Локальное планирование безопасности
        </p>
      </header>

      <main style={{ padding: '24px' }}>
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            <input
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder='Введите текст пункта...'
              style={{
                flex: 1,
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: '14px',
                fontFamily: 'system-ui, sans-serif',
              }}
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as ChecklistCategory)}
              style={{
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: '14px',
                minWidth: '120px',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,<svg xmlns=\'http://www.w3.org/2000/svg\'><polygon points="0,0 10,0 5,5"/></svg>)',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 8px top 50%',
                cursor: 'pointer',
              }}
            >
              <option value="water">Вода и еда</option>
              <option value="light">Свет и зарядка</option>
              <option value="documents">Документы</option>
              <option value="clothing">Одежда и другое</option>
            </select>
            <input
              value={newItemQuantity || ''}
              onChange={(e) => setNewItemQuantity(e.target.value)}
              placeholder='Количество (необязательно)'
              style={{
                width: '80px',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: '14px',
                textAlign: 'center',
                minWidth: '80px',
              }}
            />
            <textarea
              value={newItemNote || ''}
              onChange={(e) => setNewItemNote(e.target.value)}
              placeholder='Заметка (необязательно)'
              rows={2}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #cbd5e1',
                borderRadius: 6,
                fontSize: '14px',
                resize: 'vertical',
              }}
            /></div>
            <button
              onClick={handleAddItem}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                marginLeft: '12px',
              }}
            >
              Добавить пункт
            </button>
          </div>
        <div
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '24px' }}>
      {readinessPercentage}%
</span>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 500 }}>
                {totalItems} пунктов
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {completedItems} завершено
              </div>
            </div>
          </div>

          <button
            onClick={() => setChecklist((prev) => prev.map((item) => ({ ...item, completed: false })))}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Сбросить отметки
          </button>
        </div>

        <section
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Чек-лист готовности
          </h2>

          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            }}
          >
            {categories.map((cat) => {
              const catItems = checklist.filter((i) => i.category === cat)
              return (
                <div
                  key={cat}
                  style={{
                    border: '1px solid #4a4a4a',
                    borderRadius: 12,
                    padding: 20,
                    background: theme === 'dark' ? '#0B0F14' : '#F5F1E8',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '12px',
                    }}
                  >
                    <span style={{ fontSize: '20px', color: 'currentColor' }}>{categoryEmoji[cat]}</span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: '14px',
                      }}
                    >
                      {catDefs[cat].label}
                    </span>
                  </div>
                  {catItems.length > 0 ? (
                    catItems.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 0',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleToggleComplete(item.id)}
                        onKeyDown={(e: KeyboardEvent) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleToggleComplete(item.id)
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleComplete(item.id)}
                          style={{ transform: 'scale(1.2)' }}
                          aria-label={item.text + ' готовность'}
                        />
                        <span
                          style={{
                            flex: 1,
                            fontSize: '14px',
                            color: item.completed ? '#64748b' : '#1e293b',
                            textDecoration: item.completed ? 'line-through' : 'none',
                          }}
                        >
                          {item.text}
                        </span>
                        {item.quantity !== undefined && (
                          <span
                            style={{ color: '#64748b', fontSize: '12px' }}
                          >
                            ×{item.quantity}
                          </span>
                        )}
                        {item.note && (
                          <span
                            style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}
                          >
                            ({item.note})
                          </span>
                        )}
                        <button
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 8px',
                            background: 'transparent',
                            border: '1px solid #e2e8f0',
                            borderRadius: 4,
                            fontSize: '12px',
                            color: '#64748b',
                            cursor: 'pointer',
                            lineHeight: 1,
                          }}
                          title="Удалить"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '14px',
                        padding: '12px',
                        border: '1px dashed #e2e8f0',
                        borderRadius: 6,
                      }}
                    >
                      <em>Добавьте первый пункт</em>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Важные контакты
          </h2>

          {contacts.length > 0 ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 0',
                    borderBottom: '1px solid #f1f5f9',
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span
                    style={{ flex: 1, fontWeight: 500, fontSize: '14px' }}
                  >
                    {contact.name}
                  </span>
                  <span
                    style={{ color: '#64748b', fontSize: '13px' }}
                  >
                    {contact.phone}
                  </span>
                  {contact.note && (
                    <span
                      style={{ color: '#64748b', fontSize: '12px', fontStyle: 'italic' }}
                    >
                      ({contact.note})
                    </span>
                  )}
                  <button
                    style={{
                      marginLeft: 'auto',
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #e2e8f0',
                      borderRadius: 4,
                      fontSize: '12px',
                      color: '#64748b',
                      cursor: 'pointer',
                      lineHeight: 1,
                    }}
                    title="Удалить контакт"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                padding: '12px',
                textAlign: 'center',
              }}
            >
              <em>Добавьте первый контакт</em>
            </p>
          )}
        </section>

        <section
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
            marginBottom: 32,
            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
          }}
        >
          <h2
            style={{
              margin: '0 0 20px 0',
              fontSize: '20px',
              fontWeight: 500,
            }}
          >
            Заметки и адрес встречи
          </h2>

          <div
            style={{
              display: 'grid',
              gap: 16,
              gridTemplateColumns: '1fr 1fr',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                >Адрес места встречи</label>
              <input
                value={settings.meetingAddress}
                onChange={(e) => setSettings({ ...settings, meetingAddress: e.target.value })}
                placeholder='например: Остановка у метро, дом 5'
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                }}
                aria-label='Адрес места встречи'
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
                >Личные заметки</label>
              <textarea
                value={settings.personalNotes}
                onChange={(e) => setSettings({ ...settings, personalNotes: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                  resize: 'vertical',
                }}
                aria-label='Личные заметки'
              />
            </div>
          </div>
        </section>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 32,
          }}
        >
          <button
            onClick={exportData}
            style={{
              padding: '12px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            aria-label='Экспорт плана в JSON'
          >
            Экспорт плана
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              padding: '12px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            aria-label='Удалить все сохраненные данные'
          >
            Удалить все данные
          </button>
          {showDeleteConfirm && (
            <>
              <p
                style={{ margin: '16px 0', color: '#b91c1c' }}
              >
                Вы уверены, что хотите удалить <strong>все</strong> сохраненные данные?
                Это нельзя отменить.
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <button
                  onClick={() => confirmDeleteAll()}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Да, удалить
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    background: 'white',
                    color: theme === 'dark' ? '#EAF2F8' : '#1e293b',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Нет, отмена
                </button>
              </div>
            </>
          )}
          <button
            onClick={() => printVersion()}
            style={{
              padding: '12px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
            aria-label='Печать версии плана'
          >
            Печать
          </button>
        </div>
      </main>
    </div>
  )
}

const catDefs: Record<ChecklistCategory, { label: string }> = {
  water: { label: 'Вода и еда' },
  light: { label: 'Свет и зарядка' },
  documents: { label: 'Документы' },
  clothing: { label: 'Одежда и другое' },
}

export default App
