import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord, updateRecord } from 'lightning/uiRecordApi';
import getFilesForContact from '@salesforce/apex/J_ContactImageFileController.getFilesForContact';
import { CloseActionScreenEvent } from 'lightning/actions'; // ← 追加
import { getRecordNotifyChange } from 'lightning/uiRecordApi';

// Contact のフィールドAPI名
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import CONTACT_ID from '@salesforce/schema/Contact.Id';
import IMAGE_DOC_ID from '@salesforce/schema/Contact.ImageDocId__c';

const FIELDS = [CONTACT_ID, IMAGE_DOC_ID];

export default class JContactImageBinder extends LightningElement {
    @api recordId; // Quick Action から注入
    @track rows = [];
    @track selectedRowKeys = [];
    columns = [
        { label: 'タイトル', fieldName: 'title', type: 'text', wrapText: true },
        { label: '種類', fieldName: 'fileType', type: 'text', initialWidth: 100 },
        { label: '作成者', fieldName: 'createdByName', type: 'text', initialWidth: 160 },
        { label: '作成日', fieldName: 'createdDate', type: 'date', typeAttributes: { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }, initialWidth: 200 },
        { label: 'DocId', fieldName: 'contentDocumentId', type: 'text', initialWidth: 220 }
    ];

    currentDocId;

    // 現在の ImageDocId__c を取得して初期表示
    @wire(getRecord, { recordId: '$recordId', fields: FIELDS })
    wiredContact({ data, error }) {
        if (data) {
            this.currentDocId = data.fields.ImageDocId__c?.value || null;
            // 現在の紐づけが候補一覧に存在する場合、初期選択しておく
            if (this.rows?.length && this.currentDocId) {
                this.selectedRowKeys = this.rows
                    .filter(r => r.contentDocumentId === this.currentDocId)
                    .map(r => r.contentDocumentId);
            }
        } else if (error) {
            this.toast('エラー', '現在の紐づけ取得に失敗しました。', 'error');
        }
    }

    // 候補ファイル一覧
    @wire(getFilesForContact, { contactId: '$recordId' })
    wiredFiles({ data, error }) {
        if (data) {
            this.rows = data;
            // 現在のDocIdがあれば初期選択
            if (this.currentDocId) {
                const has = this.rows.some(r => r.contentDocumentId === this.currentDocId);
                this.selectedRowKeys = has ? [this.currentDocId] : [];
            }
        } else if (error) {
            this.toast('エラー', 'ファイル一覧の取得に失敗しました。', 'error');
        }
    }

    get bindDisabled() {
        return this.selectedRowKeys.length !== 1;
    }

    handleRowSelection(event) {
        const selected = event.detail.selectedRows || [];
        this.selectedRowKeys = selected.map(r => r.contentDocumentId);
    }

    async handleBind() {
        if (this.bindDisabled) return;
        const selectedDocId = this.selectedRowKeys[0];

        const fields = {};
        fields[CONTACT_ID.fieldApiName] = this.recordId;
        fields[IMAGE_DOC_ID.fieldApiName] = selectedDocId;

        try {
            await updateRecord({ fields });
            this.currentDocId = selectedDocId;
            getRecordNotifyChange([{ recordId: this.recordId }]);
            this.toast('完了', '画像ファイルを紐づけました。', 'success');
            this.close(this);
        } catch (e) {
            this.toast('エラー', '紐づけに失敗しました。権限や項目レベルセキュリティをご確認ください。', 'error');
        }
    }

    async handleUnlink() {
        const fields = {};
        fields[CONTACT_ID.fieldApiName] = this.recordId;
        fields[IMAGE_DOC_ID.fieldApiName] = null;

        try {
            await updateRecord({ fields });
            this.currentDocId = null;
            this.selectedRowKeys = [];
            getRecordNotifyChange([{ recordId: this.recordId }]);
            this.toast('完了', '紐づけを解除しました。', 'success');
            this.close(this);
        } catch (e) {
            this.toast('エラー', '解除に失敗しました。権限や項目レベルセキュリティをご確認ください。', 'error');
        }
    }

    handleCancel() {
        this.close(this);
    }

    close(modal) {
        // Quick Action モーダルを閉じる
        modal.dispatchEvent(new CloseActionScreenEvent());
    }

    toast(title, message, variant) {
        this.dispatchEvent(new ShowToastEvent({ title, message, variant }));
    }
}
