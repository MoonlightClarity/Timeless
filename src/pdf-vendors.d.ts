declare module 'pdfmake/build/pdfmake' {
  const pdfMake: {
    addFontContainer(container: unknown): void
    createPdf(definition: unknown): {
      download(fileName?: string): Promise<void> | void
    }
  }
  export default pdfMake
}

declare module 'pdfmake/build/standard-fonts/Times' {
  const container: unknown
  export default container
}

declare module 'pdfmake/build/standard-fonts/Helvetica' {
  const container: unknown
  export default container
}

declare module 'pdfmake/build/standard-fonts/Courier' {
  const container: unknown
  export default container
}

declare module 'html-to-pdfmake' {
  type CustomTagParams = {
    element: Element
    ret: Record<string, unknown>
    parents: Element[]
  }

  type HtmlToPdfmakeOptions = {
    window: Window
    tableAutoSize?: boolean
    removeExtraBlanks?: boolean
    defaultStyles?: Record<string, Record<string, unknown>>
    customTag?: (params: CustomTagParams) => Record<string, unknown>
  }

  const htmlToPdfmake: (
    html: string,
    options: HtmlToPdfmakeOptions,
  ) => unknown

  export default htmlToPdfmake
}
