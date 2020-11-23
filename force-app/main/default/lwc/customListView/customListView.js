import { LightningElement, api, wire, track } from 'lwc';
import getRecord from '@salesforce/apex/CustomListController.getRecord';
import getSearchRecords from '@salesforce/apex/CustomListController.getSearchRecords';
import updateRecords from '@salesforce/apex/CustomListController.updateRecords';
import sortingData from '@salesforce/apex/CustomListController.sortingData';




import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CustomListView extends LightningElement {

    @track fieldApi = [];
    @track objectApi = '';
    @track records;
    @track columns;
    draftValues = [];
    @track showSpinner = false;
    @track sortBy;
    @track sortDirection;
    @track showFilter = false;
    @track filterState = false;
    @track itemSize = false;

    constructor() {
        super();
        this.objectApi = 'Account';
        this.fieldApi = ['Id', 'Name', 'Type'];
        this.getRecord();
    }

    getRecord(event) {
        this.showSpinner = true;

        console.log('Obj' + this.objectApi);
        console.log('fieldApi' + this.fieldApi);

        getRecord({
            field: this.fieldApi,
            ObjName: this.objectApi
        })
            .then(result => {
                if (result != null && result != 'undefined') {
                    this.records = result.records;

                    console.log('records' + JSON.stringify(this.records));
                    this.totalRecords = result.total;
                    var fieldsColumn = [{ label: 'Name', fieldName: 'Name', type: 'Text', typeAttributes: { label: { fieldName: 'Name' }, tooltip: "Name", target: '_top' } },
                    { label: 'Type', fieldName: 'Type', 'type': 'text' },
                    { label: 'Website', fieldName: 'website' }];
                    var columnList = [];
                    for (var j = 0; j < fieldsColumn.length; j++) {
                        columnList.push({
                            'label': fieldsColumn[j].label,
                            'fieldName': fieldsColumn[j].fieldName,
                            'type': fieldsColumn[j].type,
                            'sortable': true,
                            'editable': true
                        });
                    }
                    this.columns = columnList;
                    /* var tempList = [];
 
                     if (this.records) {
 
                         for (var i = 0; i < this.records.length; i++) {
                             let tempRecord = Object.assign({}, this.records[i]); //cloning object  
                             tempRecord.recordLink = tempRecord.Name;
                             tempList.push(tempRecord);
                         }
                     }
                     this.records = tempList;*/
                }

                this.template.querySelector('lightning-datatable').data = this.records;
                this.showSpinner = false;
            }).catch(error => {
                console.log(error);
                if (error && error.body && error.body.message)
                    this.showNotification(error.body.message, 'error');
                this.showSpinner = false;
            })
    }
    showNotification(message, variant) {
        const evt = new ShowToastEvent({
            'message': message,
            'variant': variant
        });
        this.dispatchEvent(evt);
    }

    handleKeyChange(event) {
        const searchKey = event.target.value.toLowerCase();
        console.log('searchKey' + searchKey);

        if (searchKey) {
            getSearchRecords({
                field: this.fieldApi,
                ObjName: this.objectApi,
                serachTerm: searchKey
            })
                .then(result => {
                    console.log('******Result*****' + result.records);
                    if (result != null && result != 'undefined') {
                        this.records = result.records;
                    }
                    this.showSpinner = false;

                }).catch(error => {
                    console.log(error);
                    if (error && error.body && error.body.message)
                        this.showNotification(error.body.message, 'error');
                    this.showSpinner = false;
                })

        } else {
            this.getRecord(event);
        }
    }

    async handleSave(event) {
        const updateFields = event.detail.draftValues;
        console.log('update Fields' + updateFields)
        await updateRecords({
            data: updateFields,
        })
            .then(result => {
                console.log('*' + result);
                console.log(JSON.stringify("Apex update result: " + result));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Record(s) updated',
                        variant: 'success'
                    })
                );

                refreshApex(this.wiredRecords).then(() => {
                    this.draftValues = [];
                });

            }).catch(error => {

                console.log('Error is ' + JSON.stringify(error));
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating or refreshing records',
                        message: error.body.message,
                        variant: 'error'
                    })
                );
            });
    }

    handleRefreshButtonClick(event) {
        this.showSpinner = true;
        this.getRecord(event);
    }

    handleSortdata(event) {
        this.showSpinner = true;
        // field name
        this.sortBy = event.detail.fieldName;

        // sort direction
        this.sortDirection = event.detail.sortDirection;

        console.log('*****' + this.sortBy);
        console.log('*****' + this.sortDirection);

        sortingData({
            field: this.fieldApi,
            ObjName: this.objectApi,
            fieldName: this.sortBy,
            sortDirection: this.sortDirection
        })
            .then(result => {
                if (result != null && result != 'undefined') {
                    this.records = result.records;
                    console.log('Sort***' + JSON.stringify(this.records));
                    this.showSpinner = false;
                }
            })
            .catch(error => {
                console.log(error);
                if (error && error.body && error.body.message)
                    this.showNotification(error.body.message, 'error');
                this.showSpinner = false;
            })
    }

    handleFilterButtonClick(event) {

        this.filterState = !this.filterState;
        this.showFilter = true;

        this.itemSize = !this.itemSize;
        if (this.itemSize) {
            this.template.querySelector('.first-item').size = "9";
            this.template.querySelector('.second-item').size = "3";
        } else {
            this.template.querySelector('.first-item').size = "12";
            this.template.querySelector('.second-item').size = "1";
            this.showFilter = false;
        }

    }

}



