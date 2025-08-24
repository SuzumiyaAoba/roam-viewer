export function parseFormData(formData: FormData): Record<string, any> {
  const data: Record<string, any> = {}
  
  for (const [key, value] of formData.entries()) {
    if (key.endsWith('[]')) {
      const arrayKey = key.slice(0, -2)
      if (!data[arrayKey]) {
        data[arrayKey] = []
      }
      data[arrayKey].push(value)
    } else {
      data[key] = value
    }
  }
  
  return data
}

export function parseTagsString(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

export function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString('ja-JP')
}