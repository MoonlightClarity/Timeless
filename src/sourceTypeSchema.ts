export type SourceTypeField = { field: string; label: string; baseField?: string }
export type SourceCreatorType = { creatorType: string; label: string; primary: boolean }
export type SourceTypeDefinition = {
  itemType: string
  label: string
  titleField: string
  fields: SourceTypeField[]
  creatorTypes: SourceCreatorType[]
}

export const SOURCE_TYPES: SourceTypeDefinition[] = [
  {
    "itemType": "artwork",
    "label": "Artwork",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "artworkMedium",
        "label": "Medium",
        "baseField": "medium"
      },
      {
        "field": "artworkSize",
        "label": "Artwork Size"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "artist",
        "label": "Artist",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "audioRecording",
    "label": "Audio Recording",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "audioRecordingFormat",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "label",
        "label": "Label",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "performer",
        "label": "Performer",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "composer",
        "label": "Composer",
        "primary": false
      },
      {
        "creatorType": "wordsBy",
        "label": "Words By",
        "primary": false
      }
    ]
  },
  {
    "itemType": "bill",
    "label": "Bill",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "billNumber",
        "label": "Bill Number",
        "baseField": "number"
      },
      {
        "field": "code",
        "label": "Code"
      },
      {
        "field": "codeVolume",
        "label": "Code Volume",
        "baseField": "volume"
      },
      {
        "field": "section",
        "label": "Section"
      },
      {
        "field": "codePages",
        "label": "Code Pages",
        "baseField": "pages"
      },
      {
        "field": "legislativeBody",
        "label": "Legislative Body",
        "baseField": "authority"
      },
      {
        "field": "session",
        "label": "Session"
      },
      {
        "field": "history",
        "label": "History"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "sponsor",
        "label": "Sponsor",
        "primary": true
      },
      {
        "creatorType": "cosponsor",
        "label": "Cosponsor",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "blogPost",
    "label": "Blog Post",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "blogTitle",
        "label": "Blog Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "websiteType",
        "label": "Website Type",
        "baseField": "type"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "commenter",
        "label": "Commenter",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "book",
    "label": "Book",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesNumber",
        "label": "Series Number"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "numPages",
        "label": "# of Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "bookSection",
    "label": "Book Section",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "bookTitle",
        "label": "Book Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesNumber",
        "label": "Series Number"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "bookAuthor",
        "label": "Book Author",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "case",
    "label": "Case",
    "titleField": "caseName",
    "fields": [
      {
        "field": "caseName",
        "label": "Case Name",
        "baseField": "title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "court",
        "label": "Court",
        "baseField": "authority"
      },
      {
        "field": "dateDecided",
        "label": "Date Decided",
        "baseField": "date"
      },
      {
        "field": "docketNumber",
        "label": "Docket Number",
        "baseField": "number"
      },
      {
        "field": "reporter",
        "label": "Reporter"
      },
      {
        "field": "reporterVolume",
        "label": "Reporter Volume",
        "baseField": "volume"
      },
      {
        "field": "firstPage",
        "label": "First Page",
        "baseField": "pages"
      },
      {
        "field": "history",
        "label": "History"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "counsel",
        "label": "Counsel",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "computerProgram",
    "label": "Software",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "versionNumber",
        "label": "Version"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "system",
        "label": "System"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "company",
        "label": "Company",
        "baseField": "publisher"
      },
      {
        "field": "programmingLanguage",
        "label": "Prog. Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "programmer",
        "label": "Programmer",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "conferencePaper",
    "label": "Conference Paper",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "proceedingsTitle",
        "label": "Proceedings Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "conferenceName",
        "label": "Conference Name"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "dataset",
    "label": "Dataset",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "identifier",
        "label": "Identifier",
        "baseField": "number"
      },
      {
        "field": "type",
        "label": "Type"
      },
      {
        "field": "versionNumber",
        "label": "Version"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "repository",
        "label": "Repository",
        "baseField": "publisher"
      },
      {
        "field": "repositoryLocation",
        "label": "Repo. Location",
        "baseField": "place"
      },
      {
        "field": "format",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "citationKey",
        "label": "Citation Key"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "dictionaryEntry",
    "label": "Dictionary Entry",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "dictionaryTitle",
        "label": "Dictionary Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesNumber",
        "label": "Series Number"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "document",
    "label": "Document",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "reviewedAuthor",
        "label": "Reviewed Author",
        "primary": false
      }
    ]
  },
  {
    "itemType": "email",
    "label": "E-mail",
    "titleField": "subject",
    "fields": [
      {
        "field": "subject",
        "label": "Subject",
        "baseField": "title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "recipient",
        "label": "Recipient",
        "primary": false
      }
    ]
  },
  {
    "itemType": "encyclopediaArticle",
    "label": "Encyclopedia Article",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "encyclopediaTitle",
        "label": "Encyclopedia Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesNumber",
        "label": "Series Number"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "film",
    "label": "Film",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "distributor",
        "label": "Distributor",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "genre",
        "label": "Genre",
        "baseField": "type"
      },
      {
        "field": "videoRecordingFormat",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "director",
        "label": "Director",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "scriptwriter",
        "label": "Scriptwriter",
        "primary": false
      },
      {
        "creatorType": "producer",
        "label": "Producer",
        "primary": false
      }
    ]
  },
  {
    "itemType": "forumPost",
    "label": "Forum Post",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "forumTitle",
        "label": "Forum/Listserv Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "postType",
        "label": "Post Type",
        "baseField": "type"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "hearing",
    "label": "Hearing",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "committee",
        "label": "Committee"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "documentNumber",
        "label": "Document Number",
        "baseField": "number"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "legislativeBody",
        "label": "Legislative Body",
        "baseField": "authority"
      },
      {
        "field": "session",
        "label": "Session"
      },
      {
        "field": "history",
        "label": "History"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": true
      }
    ]
  },
  {
    "itemType": "instantMessage",
    "label": "Instant Message",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "recipient",
        "label": "Recipient",
        "primary": false
      }
    ]
  },
  {
    "itemType": "interview",
    "label": "Interview",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "interviewMedium",
        "label": "Medium",
        "baseField": "medium"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "interviewee",
        "label": "Interview With",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "interviewer",
        "label": "Interviewer",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      }
    ]
  },
  {
    "itemType": "journalArticle",
    "label": "Journal Article",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "publicationTitle",
        "label": "Publication"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "issue",
        "label": "Issue"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "seriesText",
        "label": "Series Text"
      },
      {
        "field": "journalAbbreviation",
        "label": "Journal Abbr"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "ISSN",
        "label": "ISSN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "reviewedAuthor",
        "label": "Reviewed Author",
        "primary": false
      }
    ]
  },
  {
    "itemType": "letter",
    "label": "Letter",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "letterType",
        "label": "Type",
        "baseField": "type"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "recipient",
        "label": "Recipient",
        "primary": false
      }
    ]
  },
  {
    "itemType": "magazineArticle",
    "label": "Magazine Article",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "publicationTitle",
        "label": "Publication"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "issue",
        "label": "Issue"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISSN",
        "label": "ISSN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "reviewedAuthor",
        "label": "Reviewed Author",
        "primary": false
      }
    ]
  },
  {
    "itemType": "manuscript",
    "label": "Manuscript",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "manuscriptType",
        "label": "Type",
        "baseField": "type"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "numPages",
        "label": "# of Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      }
    ]
  },
  {
    "itemType": "map",
    "label": "Map",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "mapType",
        "label": "Type",
        "baseField": "type"
      },
      {
        "field": "scale",
        "label": "Scale"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "cartographer",
        "label": "Cartographer",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "newspaperArticle",
    "label": "Newspaper Article",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "publicationTitle",
        "label": "Publication"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "edition",
        "label": "Edition"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "section",
        "label": "Section"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "ISSN",
        "label": "ISSN"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "reviewedAuthor",
        "label": "Reviewed Author",
        "primary": false
      }
    ]
  },
  {
    "itemType": "patent",
    "label": "Patent",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "country",
        "label": "Country"
      },
      {
        "field": "assignee",
        "label": "Assignee"
      },
      {
        "field": "issuingAuthority",
        "label": "Issuing Authority",
        "baseField": "authority"
      },
      {
        "field": "patentNumber",
        "label": "Patent Number",
        "baseField": "number"
      },
      {
        "field": "filingDate",
        "label": "Filing Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "applicationNumber",
        "label": "Application Number"
      },
      {
        "field": "priorityNumbers",
        "label": "Priority Numbers"
      },
      {
        "field": "issueDate",
        "label": "Issue Date",
        "baseField": "date"
      },
      {
        "field": "references",
        "label": "References"
      },
      {
        "field": "legalStatus",
        "label": "Legal Status",
        "baseField": "status"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "inventor",
        "label": "Inventor",
        "primary": true
      },
      {
        "creatorType": "attorneyAgent",
        "label": "Attorney/Agent",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "podcast",
    "label": "Podcast",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "episodeNumber",
        "label": "Episode Number",
        "baseField": "number"
      },
      {
        "field": "audioFileType",
        "label": "File Type",
        "baseField": "medium"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "podcaster",
        "label": "Podcaster",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "guest",
        "label": "Guest",
        "primary": false
      }
    ]
  },
  {
    "itemType": "preprint",
    "label": "Preprint",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "genre",
        "label": "Genre",
        "baseField": "type"
      },
      {
        "field": "repository",
        "label": "Repository",
        "baseField": "publisher"
      },
      {
        "field": "archiveID",
        "label": "Archive ID",
        "baseField": "number"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "series",
        "label": "Series"
      },
      {
        "field": "seriesNumber",
        "label": "Series Number"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "citationKey",
        "label": "Citation Key"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "editor",
        "label": "Editor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "reviewedAuthor",
        "label": "Reviewed Author",
        "primary": false
      }
    ]
  },
  {
    "itemType": "presentation",
    "label": "Presentation",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "presentationType",
        "label": "Type",
        "baseField": "type"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "meetingName",
        "label": "Meeting Name"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "presenter",
        "label": "Presenter",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "radioBroadcast",
    "label": "Radio Broadcast",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "programTitle",
        "label": "Program Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "episodeNumber",
        "label": "Episode Number",
        "baseField": "number"
      },
      {
        "field": "audioRecordingFormat",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "network",
        "label": "Network",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "director",
        "label": "Director",
        "primary": true
      },
      {
        "creatorType": "scriptwriter",
        "label": "Scriptwriter",
        "primary": false
      },
      {
        "creatorType": "producer",
        "label": "Producer",
        "primary": false
      },
      {
        "creatorType": "castMember",
        "label": "Cast Member",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "guest",
        "label": "Guest",
        "primary": false
      }
    ]
  },
  {
    "itemType": "report",
    "label": "Report",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "reportNumber",
        "label": "Report Number",
        "baseField": "number"
      },
      {
        "field": "reportType",
        "label": "Report Type",
        "baseField": "type"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "institution",
        "label": "Institution",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      },
      {
        "creatorType": "seriesEditor",
        "label": "Series Editor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "standard",
    "label": "Standard",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "organization",
        "label": "Organization",
        "baseField": "authority"
      },
      {
        "field": "committee",
        "label": "Committee"
      },
      {
        "field": "type",
        "label": "Type"
      },
      {
        "field": "number",
        "label": "Number"
      },
      {
        "field": "versionNumber",
        "label": "Version"
      },
      {
        "field": "status",
        "label": "Status"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "citationKey",
        "label": "Citation Key"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "numPages",
        "label": "# of Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "statute",
    "label": "Statute",
    "titleField": "nameOfAct",
    "fields": [
      {
        "field": "nameOfAct",
        "label": "Name of Act",
        "baseField": "title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "code",
        "label": "Code"
      },
      {
        "field": "codeNumber",
        "label": "Code Number"
      },
      {
        "field": "publicLawNumber",
        "label": "Public Law Number",
        "baseField": "number"
      },
      {
        "field": "dateEnacted",
        "label": "Date Enacted",
        "baseField": "date"
      },
      {
        "field": "pages",
        "label": "Pages"
      },
      {
        "field": "section",
        "label": "Section"
      },
      {
        "field": "session",
        "label": "Session"
      },
      {
        "field": "history",
        "label": "History"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "thesis",
    "label": "Thesis",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "thesisType",
        "label": "Type",
        "baseField": "type"
      },
      {
        "field": "university",
        "label": "University",
        "baseField": "publisher"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "numPages",
        "label": "# of Pages"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "tvBroadcast",
    "label": "TV Broadcast",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "programTitle",
        "label": "Program Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "episodeNumber",
        "label": "Episode Number",
        "baseField": "number"
      },
      {
        "field": "videoRecordingFormat",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "network",
        "label": "Network",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "director",
        "label": "Director",
        "primary": true
      },
      {
        "creatorType": "scriptwriter",
        "label": "Scriptwriter",
        "primary": false
      },
      {
        "creatorType": "producer",
        "label": "Producer",
        "primary": false
      },
      {
        "creatorType": "castMember",
        "label": "Cast Member",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "guest",
        "label": "Guest",
        "primary": false
      }
    ]
  },
  {
    "itemType": "videoRecording",
    "label": "Video Recording",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "videoRecordingFormat",
        "label": "Format",
        "baseField": "medium"
      },
      {
        "field": "seriesTitle",
        "label": "Series Title"
      },
      {
        "field": "volume",
        "label": "Volume"
      },
      {
        "field": "numberOfVolumes",
        "label": "# of Volumes"
      },
      {
        "field": "place",
        "label": "Place"
      },
      {
        "field": "studio",
        "label": "Studio",
        "baseField": "publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "runningTime",
        "label": "Running Time"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "ISBN",
        "label": "ISBN"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "archive",
        "label": "Archive"
      },
      {
        "field": "archiveLocation",
        "label": "Loc. in Archive"
      },
      {
        "field": "libraryCatalog",
        "label": "Library Catalog"
      },
      {
        "field": "callNumber",
        "label": "Call Number"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "director",
        "label": "Director",
        "primary": true
      },
      {
        "creatorType": "scriptwriter",
        "label": "Scriptwriter",
        "primary": false
      },
      {
        "creatorType": "producer",
        "label": "Producer",
        "primary": false
      },
      {
        "creatorType": "castMember",
        "label": "Cast Member",
        "primary": false
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      }
    ]
  },
  {
    "itemType": "other",
    "label": "Other",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "publicationTitle",
        "label": "Publication / Container"
      },
      {
        "field": "publisher",
        "label": "Publisher"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "DOI",
        "label": "DOI"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      }
    ]
  },
  {
    "itemType": "webpage",
    "label": "Web Page",
    "titleField": "title",
    "fields": [
      {
        "field": "title",
        "label": "Title"
      },
      {
        "field": "abstractNote",
        "label": "Abstract"
      },
      {
        "field": "websiteTitle",
        "label": "Website Title",
        "baseField": "publicationTitle"
      },
      {
        "field": "websiteType",
        "label": "Website Type",
        "baseField": "type"
      },
      {
        "field": "date",
        "label": "Date"
      },
      {
        "field": "shortTitle",
        "label": "Short Title"
      },
      {
        "field": "url",
        "label": "URL"
      },
      {
        "field": "accessDate",
        "label": "Accessed"
      },
      {
        "field": "language",
        "label": "Language"
      },
      {
        "field": "extra",
        "label": "Extra"
      }
    ],
    "creatorTypes": [
      {
        "creatorType": "author",
        "label": "Author",
        "primary": true
      },
      {
        "creatorType": "contributor",
        "label": "Contributor",
        "primary": false
      },
      {
        "creatorType": "translator",
        "label": "Translator",
        "primary": false
      }
    ]
  }
]

export const SOURCE_TYPE_MAP = new Map(
  SOURCE_TYPES.map((type) => [type.itemType, type]),
)
