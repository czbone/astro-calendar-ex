import type { EventAdminRequest } from '@/types/event'

class AdminEventFetch {
  async addEvent(params: EventAdminRequest): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      return response
    } catch (e) {
      return null
    }
  }

  async removeEvent(id: number): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/event/${id}`, {
        method: 'DELETE'
      })
      return response
    } catch (e) {
      return null
    }
  }

  async updateEvent(id: number, params: EventAdminRequest): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/event/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(params)
      })
      return response
    } catch (e) {
      return null
    }
  }

  async getEvent(id: number): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/event/${id}`)
      return response
    } catch (e) {
      return null
    }
  }

  async getEvents(): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/event`)
      return response
    } catch (e) {
      return null
    }
  }
}

export default new AdminEventFetch()
