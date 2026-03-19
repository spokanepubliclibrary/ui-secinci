
Note: This is a selected list of criteria for local UI dev use. Certain sections and values have been removed as they are not directly applicable to UI development process and will be handled at a later stage. 

# FOLIO Module Acceptance Values and Criteria (UI Modules)

## Values 
Module is secure  
Module is multi-tenant  
Module is internationalized  
Module meets current accessibility requirements  
Module offers a cohesive user experience consistent with the rest of FOLIO  
Module is scalable  

---

## Criteria
Note: Frontend criteria apply to both modules and shared libraries.  

For each consumed API package.json MUST include the interface requirement in the "okapiInterfaces" or "optionalOkapiInterfaces" section (3, 5)  
note: read more at https://github.com/folio-org/stripes/blob/master/doc/dev-guide.md#the-package-file-stripes-entry  

If provided, End-to-end tests must be written in an officially supported technology¹ (3, 4)  
note: while it's strongly recommended that modules implement integration tests, it's not a requirement  
note: these tests are defined in https://github.com/folio-org/stripes-testing  

Have i18n support via react-intl and an en.json file with English texts (8)  
Have WCAG 2.1 AA compliance as measured by a current major version of axe DevTools Chrome Extension (9)  
Use the Stripes version of referred on the Officially Supported Technologies page¹ (10, 16)  
Follow relevant existing UI layouts, patterns and norms (10)  
note: read more about current practices at https://ux.folio.org/docs/all-guidelines/  

E.g. Saving state when navigating between apps (or confirming that you’ll lose the state)  
For UI links to documentation, there is no rule on where that documentation should be hosted, i.e. docs.folio.org, or wiki.folio.org, or module-specific destinations, as long as it is publicly accessible.  
Must work in the latest version of Chrome (the supported runtime environment) at the time of evaluation (10)  