export type ChecklistCategory = 'water' | 'light' | 'documents' | 'clothing'

export interface ChecklistItem {
  id: string
  text: string
  category: ChecklistCategory
  completed: boolean
  quantity: string | undefined
  note: string | undefined
}

export type ContactsData = {
  id: string
  name: string
  phone: string
  note: string | undefined
}[]

export interface AppSettings {
  meetingAddress: string
  personalNotes: string
}