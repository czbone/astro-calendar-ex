class EventFetch {
  async getEvent(id: number): Promise<any> {
    try {
      const response = await fetch(`${import.meta.env.PUBLIC_API_URL}/event/${id}`)
      return response
    } catch (e) {
      return null
    }
  }
}
export default new EventFetch()
