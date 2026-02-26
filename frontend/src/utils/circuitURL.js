// Encode circuit state into a URL-safe string
export function encodeCircuitToURL(numQubits, operations, initialState) {
  const data = { q: numQubits, ops: operations, init: initialState }
  const json = JSON.stringify(data)
  const encoded = btoa(encodeURIComponent(json))
  const url = `${window.location.origin}${window.location.pathname}?circuit=${encoded}`
  return url
}

// Decode circuit state from current URL
export function decodeCircuitFromURL() {
  const params = new URLSearchParams(window.location.search)
  const encoded = params.get('circuit')
  if (!encoded) return null
  try {
    const json = decodeURIComponent(atob(encoded))
    const data = JSON.parse(json)
    if (!data.q || !data.ops) return null
    return { numQubits: data.q, operations: data.ops, initialState: data.init }
  } catch (e) {
    return null
  }
}

// Copy text to clipboard
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  } else {
    // Fallback for older mobile browsers
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'
    el.style.opacity = '0'
    document.body.appendChild(el)
    el.focus()
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  }
}