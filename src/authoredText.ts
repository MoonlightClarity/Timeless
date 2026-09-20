import type { JSONContent } from '@tiptap/core'

export function authoredText(node: JSONContent): string {
  if (node.type === 'citation') return ''
  if (node.type === 'text') return node.text || ''

  return (node.content || [])
    .map((child) => authoredText(child))
    .join('')
}

export function authoredHeadingText(node: JSONContent): string {
  return authoredText(node)
    .replace(/\s+/g, ' ')
    .trim()
}
