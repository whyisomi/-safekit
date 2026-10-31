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

const STORAGE_KEYS = {
  CHECKLIST: 'safekit-checklist',
  CONTACTS: 'safekit-contacts',
  SETTINGS: 'safekit-settings',
} as const

const CATEGORY_DEFS: Record<ChecklistCategory, { label: string; icon: string }> = {
  water: { label: 'Вода и еда', icon: '💧' },
  light: { label: 'Свет и зарядка', icon: '🔋' },
  documents: { label: 'Документы', icon: '📄' },
  clothing: { label: 'Одежда и другое', icon: '👕' },
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

function loadFromLocalStorage(key: string, defaultValue: any) {
  try {
    const serialized = localStorage.getItem(key)
    return serialized ? JSON.parse(serialized) : defaultValue
  } catch {
    return defaultValue
  }
}

function saveToLocalStorage(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r % 8) + 0x4
    return v.toString(16)
  })
}

function App() {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() =>
    loadFromLocalStorage(STORAGE_KEYS.CHECKLIST, [
      ...INITIAL_ITEMS.water,
      ...INITIAL_ITEMS.light,
      ...INITIAL_ITEMS.documents,
      ...INITIAL_ITEMS.clothing,
    ])
  )
  const [categories] = useState<ChecklistCategory[]>(['water', 'light', 'documents', 'clothing'])
  const [contacts, setContacts] = useState<ContactsData>(() =>
    loadFromLocalStorage(STORAGE_KEYS.CONTACTS, INITIAL_CONTACTS)
  )
  const [settings, setSettings] = useState<AppSettings>(() =>
    loadFromLocalStorage(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS)
  )
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
    saveToLocalStorage(STORAGE_KEYS.CHECKLIST, checklist)
    saveToLocalStorage(STORAGE_KEYS.CONTACTS, contacts)
    saveToLocalStorage(STORAGE_KEYS.SETTINGS, settings)
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

  const handleDeleteContact = useCallback((id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const handleResetChecklist = useCallback(() => {
    setChecklist(
      checklist.map((item) => ({ ...item, completed: false }))
    )
  }, [checklist])

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

  const printVersion = useCallback(() => {
    const catLabels: Record<ChecklistCategory, string> = {
      water: 'Вода и еда',
      light: 'Свет и зарядка',
      documents: 'Документы',
      clothing: 'Одежда и другое',
    }

    const itemsHtml: string[] = []
    const cats: ChecklistCategory[] = ['water', 'light', 'documents', 'clothing']
    for (const cat of cats) {
      const catItems = checklist.filter((i) => i.category === cat)
      if (catItems.length > 0) {
        itemsHtml.push(
          '<div style="margin-bottom: 24px; border-left: 3px solid #e5e7eb; padding-left: 12px;">'
        )
        itemsHtml.push(
          '<div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">' +
            catLabels[cat] +
            '</div>'
        )
        for (const item of catItems) {
          itemsHtml.push(
            '<div style="margin: 6px 0; padding: 6px 0; border-bottom: 1px solid #f1f5f9;" role="button" tabindex="0">'
          )
          itemsHtml.push(
            '<span style="flex:1;font-weight:500;color:' +
              (item.completed ? '#64748b' : '#1e293b') +
              ';text-decoration:' +
              (item.completed ? 'line-through' : 'none') +
              '">' +
              item.text +
              '</span>'
          )
          if (item.quantity !== undefined) {
            itemsHtml.push(
              '<span style="color:#64748b;font-size:85%;margin-left:6px;">×' + item.quantity + '</span>'
            )
          }
          if (item.note) {
            itemsHtml.push(
              '<span style="color:#64748b;font-size:85%;margin-left:6px;font-style:italic">(' + item.note + ')</span>'
            )
          }
          itemsHtml.push(
            '<button style="margin-left:auto;padding:3px 6px;font-size:10px;background:transparent;border:1px solid #e2e8f0;border-radius:3;color:#64748b;cursor:pointer;line-height:1;" title="Удалить" onclick="deleteItem(' + item.id + ')">✕</button>'
          )
          itemsHtml.push('</div>')
        }
        itemsHtml.push('</div>')
      } else {
        itemsHtml.push(
          '<div style="color:#94a3b8;font-size:13px;padding:10px;border:1px dashed #e2e8f0;border-radius:6;"><em>Добавьте первый пункт</em></div>'
        )
      }
    }

    let contactsHtml = ''
    if (contacts.length > 0) {
      contactsHtml = '<div style="margin-top: 24px;"><div style="font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Важные контакты</div>'
      for (const c of contacts) {
        contactsHtml += '<div style="margin: 4px 0; padding: 4px 0; border-bottom: 1px solid #eef2ff; role="button" tabindex="0">'
        contactsHtml += '<span style="flex:1;font-weight:500;font-size:13px;">' + c.name + '</span>'
        contactsHtml += '<span style="color:#64748b;font-size:11px;">' + c.phone + '</span>'
        if (c.note) {
          contactsHtml += '<span style="color:#64748b;font-size:10px;font-style:italic">(' + c.note + ')</span>'
        }
        contactsHtml +=
          '<button style="margin-left:auto;padding:3px 6px;font-size:10px;background:transparent;border:1px solid #e2e8f0;border-radius:3;color:#64748b;cursor:pointer;line-height:1;" title="Удалить контакт" onclick="deleteContact(' + c.id + ')">✕</button>'
        contactsHtml += '</div>'
      }
      contactsHtml += '</div>'
    } else {
      contactsHtml = '<p style="color:#94a3b8;font-size:13px;text-align:center;"><em>Добавьте первый контакт</em></p>'
    }

    const footerHtml =
      '<div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">' +
      '<p>Сгенерировано SafeKit</p>' +
      '<p>Данные хранятся локально в этом браузере через localStorage</p>' +
      '</div>'

    const total = checklist.length
    const completed = checklist.filter((i) => i.completed).length
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(
      '<!DOCTYPE html>' +
        '<html lang="ru">' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
        '<title>SafeKit - План готовности</title>' +
        '<style>' +
        'body { font-family: system-ui, sans-serif; max-width: 850px; margin: 40px auto; padding: 0; line-height: 1.6; color: #1f2937; }' +
        'h1 { color: #111827; font-size: 28px; margin-bottom: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }' +
        '.section { margin-bottom: 32px; }' +
        '.category-label { color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; display: block; }' +
        '.item { margin: 8px 0; padding: 8px; border: 1px solid #e5e7eb; border-radius: 6px; }' +
        '.item.completed { text-decoration: line-through; color: #6b7280; }' +
        '.item-text { font-weight: 500; }' +
        '.item-qty { color: #9ca3af; font-size: 90%; margin-left: 8px; }' +
        '.item-note { color: #6b7280; font-size: 90%; margin-left: 8px; font-style: italic; }' +
        '.contacts-list { margin-top: 24px; }' +
        '.contact-item { margin: 4px 0; padding: 4px 0; border-bottom: 1px solid #eef2ff; }' +
        '.contact-name { font-weight: 500; }' +
        '.contact-phone { color: #6b7280; font-size: 90%; }' +
        '.contact-note { color: #9ca3af; font-size: 90%; font-style: italic; margin-left: 4px; }' +
        '.footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }' +
        '.ready-indicator { padding: 16px; background: #f3f4f6; border-radius: 6px; margin: 24px 0; }' +
        '.ready-percent { font-size: 48px; font-weight: bold; color: #111827; }' +
        '.ready-text { margin-top: 8px; color: #6b7280; }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<h1>SafeKit - План готовности</h1>' +
        '<div class="ready-indicator">' +
        '<div class="ready-percent">' +
        pct +
        '%</div>' +
        '<div class="ready-text">готовности</div>' +
        '</div>' +
        itemsHtml.join('') +
        contactsHtml +
        footerHtml +
        '</body>' +
        '</html>'
    )
    printWindow.document.close()
    printWindow.print()
  }, [checklist, contacts])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#1e293b',
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
              <span style={{ fontSize: '24px' }}>{readinessPercentage}%</span>
            </div>
            <div>
              <div
                style={{
                  fontSize: '18px',
                  fontWeight: 500,
                }}
              >
                {totalItems} пунктов
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                }}
              >
                {completedItems} завершено
              </div>
            </div>
          </div>
          <button
            onClick={handleResetChecklist}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              fontSize: '14px',
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
              const catItems = [...checklist.filter((i) => i.category === cat)]
              const catDef = CATEGORY_DEFS[cat]
              return (
                <div
                  key={cat}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    padding: 20,
                    background: 'white',
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
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>{catDef?.icon}</span>
                    <span
                      style={{
                        fontWeight: 500,
                        fontSize: '14px',
                      }}
                    >
                      {catDef?.label}
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
                            style={{ color: '#64748b', fontSize: '12px' }}
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
                          onKeyDown={(e: KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleDeleteItem(item.id)
                            }
                          }}
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
                      <span
                        style={{ fontStyle: 'italic', color: '#94a3b8', fontSize: '13px' }}
                      >
                        &nbsp;Добавьте первый пункт
                      </span>
                    </div>
                  )
                  }
                </div>
              )
            })}
          </div>

          <div
            style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}
          >
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              }}
            >
              <input
                value={newItemText}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemText(e.target.value)}
                placeholder='Название предмета'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                }}
                aria-label='Название предмета для чек-листа'
                autoFocus
              />
              <select
                value={newItemCategory}
                onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                  setNewItemCategory(e.target.value as ChecklistCategory)
                }
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                }}
                aria-label='Категория предмета'
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_DEFS[cat]?.label}
                  </option>
                ))}
              </select>
              <input
                value={newItemQuantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemQuantity(e.target.value)}
                placeholder='Количество (опционально)'
                type='number'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                  width: '100%',
                }}
                aria-label='Количество предмета'
              />
              <input
                value={newItemNote}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewItemNote(e.target.value)}
                placeholder='Заметка (опционально)'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                  width: '100%',
                }}
                aria-label='Заметка к предмету'
              />
              <button
                onClick={handleAddItem}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                aria-label='Добавить предмет в чек-лист'
              >
                Добавить
              </button>
            </div>
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
                  onClick={() => {}}
                  onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                    }
                  }}
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
                    title='Удалить контакт'
                    onClick={() => handleDeleteContact(contact.id)}
                    onKeyDown={(e: KeyboardEvent) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleDeleteContact(contact.id)
                      }
                    }}
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
              <span style={{ fontStyle: 'italic', color: '#94a3b8' }}>Добавьте первый контакт</span>
            </p>
          )}

          <div
            style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}
          >
            <div
              style={{
                display: 'grid',
                gap: 12,
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              }}
            >
              <input
                value={newContactName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewContactName(e.target.value)}
                placeholder='Имя контакта'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                }}
                aria-label='Имя контакта'
              />
              <input
                value={newContactPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewContactPhone(e.target.value)}
                placeholder='Телефон'
                type='tel'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                  width: '100%',
                }}
                aria-label='Телефон контакта'
                inputMode='tel'
              />
              <input
                value={newContactNote}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewContactNote(e.target.value)}
                placeholder='Заметка (опционально)'
                style={{
                  padding: '8px 12px',
                  border: '1px solid #cbd5e1',
                  borderRadius: 6,
                  fontSize: '14px',
                  width: '100%',
                }}
                aria-label='Заметка к контакту'
              />
              <button
                onClick={handleAddContact}
                style={{
                  padding: '8px 16px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                aria-label='Добавить контакт'
              >
                Добавить
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            background: 'white',
            borderRadius: 12,
            padding: 24,
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
              >
                Адрес места встречи
              </label>
              <input
                value={settings.meetingAddress}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSettings({ ...settings, meetingAddress: e.target.value })
                }
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
              >
                Личные заметки
              </label>
              <textarea
                value={settings.personalNotes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setSettings({ ...settings, personalNotes: e.target.value })
                }
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
            onClick={handleDeleteAllData}
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
                  onClick={confirmDeleteAll}
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
                    color: '#1e293b',
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
            onClick={printVersion}
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

export default App