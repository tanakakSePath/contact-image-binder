public with sharing class J_ContactImageFileController {
    public class FileRow {
        @AuraEnabled public Id contentDocumentId;
        @AuraEnabled public String title;
        @AuraEnabled public String fileType;
        @AuraEnabled public DateTime createdDate;
        @AuraEnabled public String createdByName;
    }

    @AuraEnabled(cacheable=true)
    public static List<FileRow> getFilesForContact(Id contactId) {
        if (contactId == null) return new List<FileRow>();

        List<FileRow> rows = new List<FileRow>();
        // Contact に「現在リンクされている」ファイルだけを候補にする
        for (ContentDocumentLink cdl : [
            SELECT ContentDocumentId,
                   ContentDocument.Title,
                   ContentDocument.FileType,
                   ContentDocument.CreatedDate,
                   ContentDocument.CreatedBy.Name
            FROM ContentDocumentLink
            WHERE LinkedEntityId = :contactId
            ORDER BY ContentDocument.CreatedDate DESC
        ]) {
            FileRow r = new FileRow();
            r.contentDocumentId = cdl.ContentDocumentId;
            r.title            = cdl.ContentDocument.Title;
            r.fileType         = cdl.ContentDocument.FileType;
            r.createdDate      = cdl.ContentDocument.CreatedDate;
            r.createdByName    = cdl.ContentDocument.CreatedBy.Name;
            rows.add(r);
        }
        return rows;
    }
}
