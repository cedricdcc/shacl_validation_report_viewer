# shacl_validation_report_viewer
a HTML way to load in and view a shacl validation report in ttl

# shacl for getting all things for validationreport:

SELECT ?shaclresult ?focusnode ?resultpath ?severity ?sourceConstraintComponent	 ?resultMessage WHERE { 
?s <http://www.w3.org/ns/shacl#result> ?shaclresult . 
?shaclresult <http://www.w3.org/ns/shacl#focusNode> ?focusnode .
?shaclresult <http://www.w3.org/ns/shacl#resultPath> ?resultpath .
?shaclresult <http://www.w3.org/ns/shacl#resultSeverity> ?severity .
?shaclresult <http://www.w3.org/ns/shacl#sourceConstraintComponent> ?sourceConstraintComponent .
?shaclresult <http://www.w3.org/ns/shacl#resultMessage> ?resultMessage .
} LIMIT 50