public with sharing class CustomListController {
    public CustomListController() {

    }

    @AuraEnabled
    public static sObjectWrapper getRecord(List<String> field,String ObjName) {
        
        String fields='Select ';
        String countQuery='SELECT ID FROM '+ObjName;


        List<sObject> count=new List<sObject>();
        
        for(String f:field){
            fields=fields+','+' '+f;
        }
        
        fields=fields.replaceFirst(',', '');
        
        sObjectWrapper WrapperObject = new sObjectWrapper();   

        count = database.query(countQuery);
        WrapperObject.total=count.size();
        
        String query=	 fields +' FROM '+ObjName;	        
        system.debug('query'+query);  
        
        List<sObject> recordList=database.query(query);   //fetch all records from orgs.
        WrapperObject.records=new List<sObject>();
        WrapperObject.records.addAll(recordList);

        return WrapperObject; 
    }

    @AuraEnabled 
    public static sObjectWrapper getSearchRecords(List<String> field,String ObjName,String serachTerm) {
        System.debug('field'+field);
        String fields='';
        for(String f:field){
            fields=fields+','+' '+f;
        }
        fields=fields.replaceFirst(',', '');
        System.debug(fields);
        sObjectWrapper WrapperObject = new sObjectWrapper();    
        String query = 'FIND \'' + String.escapeSingleQuotes(serachTerm) + '\' IN ALL FIELDS RETURNING ' + ObjName + '(' + fields + ')';
        System.debug('query'+query);
        List<sObject> recordList=Search.query(query)[0];
        System.debug('SOSL'+recordList);
        WrapperObject.records=new List<sObject>();
        WrapperObject.records.addAll(recordList);

        return WrapperObject; 
    }


    @AuraEnabled
    public static string updateRecords( Object data ) {

        System.debug('data'+data);
        
        List < Account > accsForUpdate = ( List < Account > ) JSON.deserialize(
            JSON.serialize( data ),
            List < Account >.class
        );
        try {
            update accsForUpdate;
            return 'Success: Account(s) updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }

    }

    
    @AuraEnabled
    public static sObjectWrapper sortingData(List<String> field,String ObjName,String fieldName,String sortDirection) {
        String fields='Select ';
        
        for(String f:field){
            fields=fields+','+' '+f;
        }
        
        fields=fields.replaceFirst(',', '');
        
        sObjectWrapper WrapperObject = new sObjectWrapper();   
        
        String query= fields +' FROM '+ObjName+' Order By '+fieldName+' '+sortDirection;
        system.debug('query'+query);
        WrapperObject.records = database.query(query);
        
        return WrapperObject; 
    }
    
 
       // create a wrapper class with @AuraEnabled Properties     
    public class sObjectWrapper { 
        @AuraEnabled public Integer total {get;set;} 
        @AuraEnabled public List<sObject> records {get;set;} 
    } 

}
