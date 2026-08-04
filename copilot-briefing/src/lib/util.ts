export function downloadText(txt: string, fname: string) {
  const blob = new Blob([txt], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = fname; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export async function copyText(txt: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(txt); return true } catch { return false }
}
