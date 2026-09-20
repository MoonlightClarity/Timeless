import Image from '@tiptap/extension-image'

const FigureImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({
          'data-align': attributes.align || 'center',
        }),
      },
      figureNumber: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-figure-number') || '',
        renderHTML: (attributes) => attributes.figureNumber
          ? { 'data-figure-number': attributes.figureNumber }
          : {},
      },
      figureTitle: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-figure-title') || '',
        renderHTML: (attributes) => attributes.figureTitle
          ? { 'data-figure-title': attributes.figureTitle }
          : {},
      },
      figureNote: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-figure-note') || '',
        renderHTML: (attributes) => attributes.figureNote
          ? { 'data-figure-note': attributes.figureNote }
          : {},
      },
    }
  },
})

export default FigureImage
