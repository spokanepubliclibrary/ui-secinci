# Track Settings: Admin Guide

## What is Track Settings?

**Track Settings** is the control center for managing how security incidents are tracked and documented in your library.  
It lets you customize categories, types, locations, trespass templates, and reasons—so **Track** fits your organization’s needs.

---

## What Can You Do in Track Settings?

### Incident Categories and Incident Types
In Track Settings, Incident Categories and Incident Types work together to help you organize and report security incidents in your library.

### Incident Categories
Incident Categories are broad groups, like “Theft” or “Disturbance.” They help you sort incidents into meaningful sections for easier tracking and analysis.

### Incident Types
Incident Types are the specific kinds of incidents that happen, such as “Verbal Abuse” or “Property Damage.” Every Incident Type belongs to one Incident Category. For example, “Verbal Abuse” might be part of the “Disturbance” category.

### How This Works in the UI
When you **add or edit an Incident Type**, you’ll be asked to choose which **Category** it belongs to.  
Categories help you keep your Incident Types organized, so reports and searches are clearer. The 'description' field is required. The information for the description will help admin and staff users to have more specificity for reference when choosing an incident type when creating or editing a report.
You can **filter Incident Types by Category** when viewing or selecting them, making it easier to find what you need. The description of the incident type is also rendered for better reference. 

### Summary
**Incident Categories** are the big groups; **Incident Types** are the specific incidents within those groups.  
This setup makes it simple to organize, find, and report incidents in a way that fits your library’s needs.


## Locations, Zones, and Custom Locations
Set up all library locations and sub-locations (like **“Main Branch”** or **“Children’s Area”**) to accurately record where incidents happen.

### Service locations
Service locations for Track are derived from the official institutional level FOLIO locations, populating the 'select location' dropdown selector in Track Locations Settings. You can select a location and save it to Track locations. The 'location' value of a service location derived from the institution cannot be edited.  

### Custom locations
Custom locations are available for configuration in Track to allow libraries to record incidents in areas that aren't part of their official FOLIO location setup - such as outdoor spaces, shared facilities, or temporary event areas. This makes reporting and analysis more accurate for all parts of the library's environment. 

Custom locations for Track are user inputted with the 'name' value as required. The name of a custom location cannot be the same as the name of an existing Track service location. The 'name' value of a custom location may be edited.

### Zones
Zones are configurable for any Track service location, whether it was derived from institutional FOLIO locations or a custom location. Each location can have many zones, with the requirement that each zone has a 'name' field, 'description' is optional. Individual zones are not editable, although they can be removed for replacement. 

### How It Works in the UI - Managing Locations and Zones
- Go to **Settings** and choose **Locations**.
- You’ll see a list of your library’s official locations. You can add new locations (custom ones) if needed.
- For each location, you can add zones to break it down into smaller areas. For example, add "Reading Nook" as a zone under "Main Branch."
- Zones help you record exactly where something happened, making reports more detailed and useful.

### Using Locations and Zones When Reporting Incidents
- When you create or edit an incident, you’ll select a location from a dropdown menu.
- If zones are set up for that location, you’ll also be able to pick the specific zone.
- Custom locations appear in the same list, so you can always record incidents in any area you need.

### Editing and Removing
- You can edit the name of a custom location if needed, but official locations cannot be changed.
- Zones can be removed and replaced, but their names and descriptions cannot be edited once created.

### Summary
- **Locations** help you track where incidents happen at a high level.
- **Zones** let you be more specific within each location.
- **Custom Locations** allow you to add new areas for tracking, so nothing is missed.
- The UI makes it easy to select, add, and organize these places, so your incident records are always clear and complete.


## Trespass Document Templates
### What Are Trespass Document Templates?
A **Trespass Document Template** is a pre-made notice that you can use when someone needs to be officially notified about a trespass.  
Instead of writing a new notice every time, you set up templates in advance. These templates can include special placeholders (like a person’s name or the date) that get filled in automatically when you use them.

### How Do You Manage Templates in Track?
### Go to Settings
In the Track app, open the **Settings** section and choose **“Trespass Templates.”**

### View Existing Templates
You’ll see a list of all your current trespass templates.  
Each template shows its **name**, **description**, and whether it’s **active** or **set as the default**.

### Add a New Template
Click the **“Add”** or **“New”** button.  
Fill in the template’s name and description, and write the notice text.  
You can insert placeholders for things like names or dates, so each notice is personalized. 

### Inserting tokens
Use the 'insert' button in the editor's menu to open the tokens modal. Choose the token(s) you want and click 'Insert selected tokens' button. This will write your selected tokens to the last place your cursor was in the editor's text area. It is not advised to copy and paste tokens from one space to another in the editor because if there is a typo (ex: missing bracket, nudged spacing inside the token text) that token will not be read by the program and data will not be dynamically written onto the final trespass document. 

### Edit a Template
Click on a template to view its details. Choose **“Edit”** to update the wording or change which placeholders are used.  
You can also preview how the notice will look before saving.

### Set a Default Template
You can mark one template as the **default**.  
This means it will be used automatically when creating a new trespass notice, unless you choose a different one. If one template is already default and you update a different template to default, that most recently updated template will then override to become the new default. A template cannot be both 'default' and not active - if a template is saved as 'default' but not active, the update will revert to 'active'. If no template is chosen as the default the program will not automate trespass documents. 

### Delete a Template
If you no longer need a template, you can delete it.  
You’ll be asked to confirm before it’s removed.

### How Are Templates Used When Reporting Incidents?
- When you create or edit an incident that involves a trespass, **Track** will use your default template to generate the notice.  
- The system fills in the placeholders with the correct information (like the person’s name and the date).  
- You can preview the notice before saving or sending it.  
- The final document is attached to the incident record for future reference.

### Tips for Admins
- **Keep Templates Clear and Professional:** Use simple, direct language in your notices.  
- **Use Placeholders Wisely:** They help personalize each notice without extra work.  
- **Preview Before Saving:** Always check how the notice will look to make sure it’s correct.  
- **Set a Default Template:** This ensures the programmatic trespass document generation is in effect.

Trespass Document Templates make it easy to create, manage, and send official notices.  
With Track, you can be sure every trespass notice is **accurate**, **consistent**, and **ready when you need it**.


## Trespass Reasons
Manage the list of reasons for issuing trespass notices, and choose which are active or default. Trespass Reasons are the explanations you give when someone is being issued a trespass notice at your library. They help you keep a clear record of **why** a person is being asked to leave or stay away.

### How Do Trespass Reasons Work in the UI?
### Where to Find Them
Go to the **Settings** section and select **Trespass Reasons**.

### What You See
You’ll see a list of all the trespass reasons your library uses.  
Each reason is a short description, such as:

- “Repeated disruptive behavior”  
- “Violation of library policy”  

These help staff choose consistent explanations for each trespass action.

### Adding a New Reason
Click the **Add** button to create a new reason.  
Type in your explanation and save it.  
This new reason will now be available whenever staff need to issue a trespass notice.

### Default Reason
You can mark one reason as the **default**.  
This means it will be automatically selected when staff are filling out a trespass notice — but they can always choose a different reason if needed.

### Suppressing a Reason
If you no longer want a reason to appear for staff to select, you can **suppress** it.  
Suppressed reasons are hidden from the selection list but not deleted, so your historical records remain accurate.

### Editing or Removing
You can edit the text of a reason if you need to update its wording.  
If a reason is no longer needed, suppress it instead of deleting it to keep your data and reports consistent.

### When Are Trespass Reasons Used?

Whenever staff issue a trespass notice to a customer (for example, during an **incident report**), they will select a reason from your list.  
This reason is included in both the **official trespass notice** and your **incident records**, making it clear why the action was taken.

### Summary
Trespass Reasons help your team stay **consistent**, **clear**, and **accurate** when documenting why someone is being trespassed.  
You control the list in **Settings**, making it easy to update as your library’s needs change.

---

## Getting Started

### 1. Open Track Settings
Go to the **Settings** section in Track.  
You’ll see a menu with options for:
- Categories  
- Types  
- Locations  
- Trespass Templates  
- Trespass Reasons

### 2. Choose What to Manage
Click on the area you want to update (for example, **“Incident Categories”**).

### 3. View, Add, Edit, or Delete
- **View:** See the current list of items.  
- **Add:** Click the **New** or **Add** button to create a new item. Fill in the details and save.  
- **Edit:** Click on an item to view details, then choose **Edit** to make changes.  
- **Delete:** Use the delete button to remove items you no longer need. You’ll be asked to confirm before anything is deleted.

### 4. Save Your Changes
After adding or editing, always click **Save** or **Save and Close** to keep your updates.

### 5. Use Modals and Previews
For trespass templates, you can preview documents before saving.  
You can also insert tokens (like names or dates) to personalize notices.


## Tips for Admins
- **Keep Categories and Types Organized:** Clear names make reporting easier.  
- **Double-Check Before Deleting:** Deleted items can’t be recovered.  
- **Use Templates for Consistency:** Trespass templates help ensure notices are professional and complete.  
- **Set Defaults Carefully:** Default reasons and templates are used most often, so choose what fits your policies.
