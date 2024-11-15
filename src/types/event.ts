export interface EventResponse {
  id: number
  title: string
  start: string
  end: string
  allDay: boolean
  color: string
}

export interface EventDetailResponse extends EventResponse {
  description?: string
}

export interface EventAdminResponse {
  id: number
  title: string
  start: string
  end: string
  allDay: boolean
  categoryId: number
}

export interface EventAdminRequest {
  title: string
  allDay: boolean
  start: string
  end: string
  category: number
  description: string
}
