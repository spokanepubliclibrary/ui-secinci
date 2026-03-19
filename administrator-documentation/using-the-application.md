# Track Application – Admin Guide

## What is Track?
Track is a library security incident management tool. It helps staff record, organize, and follow up on incidents such as disturbances, thefts, or trespass events. Track keeps all reports in one place, making it easy to search, review, and update records.

---

## Getting Started

### Access Track
Open Track from your library’s main menu. You’ll see options to view incidents, create new reports, and manage settings.

### Create a New Incident
Click **“Create report.”** Fill in details like incident type, location, people involved, and a description. You can attach files (photos, documents) and add witnesses.  

### Max file sizes for images and video
- Image: 10MB
- Video: 100MB

### Administrative data on a report
Inside the 'Administrative data' accordion in the UI you can view details for **metadata** and **view the UI checkbox for 'Staff suppress'**.

#### Metadata
View record created date and time, record created by, and if relevant the last updated date and time, and user who last updated the record. The created by and updated by user name rendered is a link to that user's profile view in the Users application. 

#### Staff suppress 
Checking the staff suppress checkbox and saving the record will remove the record from appearing in default. This action can be reverted in Edit mode. To view staff suppressed records in a search use the 'Staff suppressed' filter section to choose 'Yes' or 'Both' (default is 'No').

### Non-customer Incident Report
You can choose the UI checkbox 'Customer n/a' for building a report that is not associated with a customer. In Edit mode, this can be unchecked and will allow for a customer to be added to the report. You can also edit a customer related report to move from customer related to non-customer. Checking the 'Customer n/a' box in this scenario will remove the previously associated customer(s) from the report. 

### Edit or View Incidents
Select any incident to see full details. You can update information, add attachments/remove attachments, or change the status.

### Search and Filter
When you view the incident records, you’ll see a **search bar** and several **filter options**. 
These tools make it easy to find exactly what you’re looking for, even in a large database.

---

### Search Features in the UI

#### 1. Search Index Dropdown
You can choose how you want to search using a dropdown menu.  
Each option targets different information:

##### **Keywords (Default)**
This is the broadest search.  
It looks for your search terms almost everywhere—**customer names**, **descriptions**, **incident types**, **witness names**, **barcodes**, and even the **incident’s own details**.  
If you’re not sure where to look, start here.

##### **Name or Barcode**
Focuses on **customer first names**, **last names**, and **barcodes**.  
Best when you already know the person involved.

##### **Customer Description**
Searches only the **description fields** for customers and the **detailed description of the incident**.  
Use this to find incidents based on what was written about a customer or the event.

##### **Witnessed By**
Looks for matches in the **names and barcodes of witnesses**.  
Use this if you want to find incidents involving a specific witness.

##### **Created By**
Searches for the **staff member** who created the incident, using their name or barcode.  
Useful for tracking incidents entered by a particular staff member.

### 2. Additional Filters
You can narrow your search further using filters for:
- **Location:** Find incidents that happened at a specific branch or area.  
- **Date Range:** Search for incidents within a certain time period.  
- **Incident Type:** Filter by the type of incident (e.g., trespass, disturbance).  
- **Trespass Status:** Show only incidents where someone was trespassed, or filter by current/expired trespass.  
- **Staff Suppression:** Choose to see only non-suppressed, suppressed, or all incidents. Non-suppressed is the default.

### 3. Sorting Options
You can sort your results by:
- **Date of Incident:** Shows the newest or oldest incidents first.  
- **Trespass Expiration Date:** Sorts by when trespass bans expire.  
- **Location, Incident Type, Created By, Customers, Witnesses:**  
  Sorts alphabetically or naturally by these fields, making it easy to group similar incidents together.

### What Happens Behind the Scenes
- The system uses your search and filter choices to look through the database and find matching incidents.  
- If you use the **Keywords** search, it checks almost every field for matches—providing the widest results.  
- Other search options (like **Created By** or **Witnessed By**) are more focused and only look at specific fields.  
- Filters and sorting help you quickly narrow down and organize results.  

### Summary
Users can easily **search**, **filter**, and **sort** incident records using a user-friendly interface.  
The system is designed to help you find what you need quickly—whether you’re looking for a **specific person**, **incident type**, or simply **browsing recent events**.  

The search options are flexible:  
- **Broad when you need them**, and  
- **Focused when you want precision**.

---

### Results in the UI - Sorting and Choosing Columns in Incident Results
Users can customize how incident records appear in the results list by sorting columns and choosing which columns to display.  
These tools help you organize and focus on the most relevant information for your workflow.

### Column Sorting
In the **incident results list**, you can sort records by clicking any column header.

### Sortable Columns
You can sort by:
- **Customers**  
- **Location**  
- **Date of Incident**  
- **Incident Type**  
- **Witnessed By**  
- **Created By**  
- **Trespass Expiration**

### How Sorting Works
- Clicking a column header toggles between **ascending** and **descending** order.  
- The system updates the results instantly, showing incidents sorted by your chosen field and direction.  
- Sorting **persists** when you page through results or apply filters, keeping your view consistent.

### How It Works Behind the Scenes
- When you change sorting or visibility, the UI updates the query and re-renders the results.  
- The backend returns only the data you need, in the order you requested.

### Choosing Which Columns to Display
Use the **Column Chooser** (from within the 'Action' button in the Results pane) to customize which columns are visible in the results list.

### Available Columns
You can show or hide:
- **Location**  
- **Date of Incident**  
- **Incident Type**  
- **Witnessed By**  
- **Created By**  
- **Trespass Expiration**

Your column selections are **saved for your session**, so your layout stays personalized as you work. 
This helps you focus on the information most relevant to your tasks.

### Summary
Users can **sort incident records** by any key field and **customize which columns** are displayed.  
This flexibility makes it easy to organize, review, and find information quickly—streamlining your workflow in Track.

---

### Settings
Admins can manage **categories**, **types**, **locations**, **trespass templates**, and **trespass reasons** in the Settings area. This customizes Track for your library’s needs.

### Trespass Redeclaration – What It Means and How It Works
Redeclaration is the process of updating or re-issuing a trespass notice for a customer. This is needed if the trespass period changes, new reasons are added, or the declaration needs to be refreshed.

### Rules for Redeclaration

**Eligibility:**  
You can only redeclare a trespass if the customer has at least one current, valid (not suppressed) trespass reason selected.

**UI Behavior:**  
In the incident edit screen, you’ll see a checkbox labeled **“Update declaration.”** This is only enabled if the above rule is met.

**What Happens:**  
When you redeclare, Track generates a new trespass document for the customer. The updated document includes the latest reasons, dates, and other details.

**Why Redeclare?**  
Redeclaration ensures the trespass notice is up-to-date and legally valid. It’s useful if circumstances change or if the original notice needs to be refreshed.

---

## Linking Reports – How and Why

### What is Linking?
Linking connects related incident reports. For example, if two incidents involve the same person or event, you can link them together.

### How to Link Reports
1. In the incident edit or create screen, use the **“Link reports”** option.  
2. Search for other incidents using filters (type, location, trespass status, etc.).  
3. Select the reports you want to link.

### Rules and Logic
- Linked reports appear in each other’s details pane.  
- You’ll see a list of linked reports, making it easy to jump between them.  
- Linking does **not** merge data.  
- Each report keeps its own details, but staff can quickly see connections.  
- You can link and unlink reports at any time.  
- This helps track patterns or repeated incidents.

---

## Tips for Admins
- Keep categories and types organized for easier reporting.  
- Double-check before deleting items in settings; deleted items cannot be recovered.  
- Use templates for trespass notices to ensure consistency.  
- Set defaults carefully for reasons and templates.