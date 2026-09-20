export const SOURCE_TO_CSL_TYPE: Record<string, string> = {
  "preprint": "article",
  "journalArticle": "article-journal",
  "magazineArticle": "article-magazine",
  "newspaperArticle": "article-newspaper",
  "bill": "bill",
  "book": "book",
  "podcast": "broadcast",
  "tvBroadcast": "broadcast",
  "radioBroadcast": "broadcast",
  "bookSection": "chapter",
  "dataset": "dataset",
  "document": "document",
  "attachment": "document",
  "note": "document",
  "dictionaryEntry": "entry-dictionary",
  "encyclopediaArticle": "entry-encyclopedia",
  "artwork": "graphic",
  "hearing": "hearing",
  "interview": "interview",
  "case": "legal_case",
  "statute": "legislation",
  "manuscript": "manuscript",
  "map": "map",
  "film": "motion_picture",
  "videoRecording": "motion_picture",
  "conferencePaper": "paper-conference",
  "patent": "patent",
  "letter": "personal_communication",
  "email": "personal_communication",
  "instantMessage": "personal_communication",
  "forumPost": "post",
  "blogPost": "post-weblog",
  "report": "report",
  "computerProgram": "software",
  "audioRecording": "song",
  "presentation": "speech",
  "standard": "standard",
  "thesis": "thesis",
  "webpage": "webpage",
  "other": "document"
}

export const CSL_TEXT_TO_SOURCE_FIELDS: Record<string, string[]> = {
  "abstract": [
    "abstractNote"
  ],
  "archive": [
    "archive"
  ],
  "archive_location": [
    "archiveLocation"
  ],
  "authority": [
    "authority"
  ],
  "call-number": [
    "callNumber",
    "applicationNumber"
  ],
  "chapter-number": [
    "session"
  ],
  "collection-number": [
    "seriesNumber"
  ],
  "collection-title": [
    "seriesTitle",
    "series"
  ],
  "container-title": [
    "publicationTitle",
    "reporter",
    "code"
  ],
  "dimensions": [
    "artworkSize",
    "runningTime"
  ],
  "DOI": [
    "DOI"
  ],
  "edition": [
    "edition"
  ],
  "event-place": [
    "place"
  ],
  "event-title": [
    "meetingName",
    "conferenceName"
  ],
  "genre": [
    "type",
    "programmingLanguage"
  ],
  "ISBN": [
    "ISBN"
  ],
  "ISSN": [
    "ISSN"
  ],
  "issue": [
    "issue",
    "priorityNumbers"
  ],
  "journalAbbreviation": [
    "journalAbbreviation"
  ],
  "language": [
    "language"
  ],
  "license": [
    "rights"
  ],
  "medium": [
    "medium",
    "system"
  ],
  "note": [
    "extra"
  ],
  "number": [
    "number"
  ],
  "number-of-pages": [
    "numPages"
  ],
  "number-of-volumes": [
    "numberOfVolumes"
  ],
  "page": [
    "pages"
  ],
  "publisher": [
    "publisher"
  ],
  "publisher-place": [
    "place"
  ],
  "references": [
    "history",
    "references"
  ],
  "scale": [
    "scale"
  ],
  "section": [
    "section",
    "committee"
  ],
  "shortTitle": [
    "shortTitle"
  ],
  "source": [
    "libraryCatalog"
  ],
  "status": [
    "status"
  ],
  "title": [
    "title"
  ],
  "title-short": [
    "shortTitle"
  ],
  "URL": [
    "url"
  ],
  "version": [
    "versionNumber"
  ],
  "volume": [
    "volume",
    "codeNumber"
  ]
}

export const CSL_DATE_TO_SOURCE_FIELD: Record<string, string> = {
  "accessed": "accessDate",
  "issued": "date",
  "submitted": "filingDate"
}

export const SOURCE_TO_CSL_NAME_FIELD: Record<string, string> = {
  "author": "author",
  "bookAuthor": "container-author",
  "castMember": "performer",
  "composer": "composer",
  "contributor": "contributor",
  "director": "director",
  "editor": "editor",
  "guest": "guest",
  "interviewer": "interviewer",
  "producer": "producer",
  "recipient": "recipient",
  "reviewedAuthor": "reviewed-author",
  "seriesEditor": "collection-editor",
  "scriptwriter": "script-writer",
  "translator": "translator"
}
