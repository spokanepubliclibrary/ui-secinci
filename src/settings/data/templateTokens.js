
import getTodayDate from "../../components/incidents/helpers/getTodayDate";
const todayDate = getTodayDate(); 
const twoWeeksFromTodayDate = new Date(new Date(todayDate).getTime() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString(); 

// value/label objects for checkbox
export const tokensArray = [
  {
    label: 'customer.trespass.declarationOfService.user',
    value: '{{declarationOfServiceIssuedBy}}'
  },

  // WITH resolve helper func syntax:
  { 
    label: 'customer.barcode',
    value: '{{resolve "customer.barcode"}}'
  },
  { 
    label: 'customer.description',
    value: '{{resolve "customer.description"}}'
  },
  { 
    label: 'customer.details.city',
    value: '{{resolve "customer.details.city"}}'
  },
  // { 
  //   label: 'customer.details.descriptionOfCustomerAtOccurrence',
  //   value: '{{resolve "customer.details.descriptionOfCustomerAtOccurrence"}}'
  // },
  { 
    label: 'customer.details.eyes',
    value: '{{resolve "customer.details.eyes"}}'
  },
  { 
    label: 'customer.details.hair',
    value: '{{resolve "customer.details.hair"}}'
  },
  { 
    label: 'customer.details.height',
    value: '{{resolve "customer.details.height"}}'
  },
  { 
    label: 'customer.details.race',
    value: '{{resolve "customer.details.race"}}'
  },
  { 
    label: 'customer.details.sex',
    value: '{{resolve "customer.details.sex"}}'
  },
  { 
    label: 'customer.details.state',
    value: '{{resolve "customer.details.state"}}'
  },
  { 
    label: 'customer.details.streetAddress',
    value: '{{resolve "customer.details.streetAddress"}}'
  },
  { 
    label: 'customer.details.weight',
    value: '{{resolve "customer.details.weight"}}'
  },
  { 
    label: 'customer.details.zipcode',
    value: '{{resolve "customer.details.zipcode"}}'
  },

  { 
    label: 'customer.firstName',
    value: '{{resolve "customer.firstName"}}'
  },
  { 
    label: 'customer.lastName',
    value: '{{resolve "customer.lastName"}}'
  },
  { 
    label: 'customer.fullName',
    value: '{{resolve "customer.fullName"}}'
  },

  { 
    label: 'customer.trespass.dateOfOccurrence',
    value: '{{formatDate (resolve "customer.trespass.dateOfOccurrence")}}'
  },
  { 
    label: 'customer.trespass.declarationOfService.date',
    value: '{{formatDate (resolve "customer.trespass.declarationOfService.date")}}'
  },


  {
    label: 'customer.trespass.declarationOfService.placeSigned',
    value: '{{formatLocation customer.trespass.declarationOfService.placeSigned}}'
  },
  { 
    label: 'customer.trespass.declarationOfService.signature',
    value: '{{resolve "customer.trespass.declarationOfService.signature"}}'
  },
  { 
    label: 'customer.trespass.declarationOfService.title',
    value: '{{resolve "customer.trespass.declarationOfService.title"}}'
  },
  { 
    label: 'customer.trespass.descriptionOfOccurrence',
    value: '{{{trespassDescriptionPlain}}}'
  },
  { 
    label: 'customer.trespass.endDateOfTrespass',
    value: '{{formatDate (resolve "customer.trespass.endDateOfTrespass")}}'
  },
  // array fields in trespass:
  { 
    label: 'customer.trespass.exclusionOrTrespassBasedOn',
    value: '{{resolveTrespassReasons customer.trespass.exclusionOrTrespassBasedOn}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.firstName',
    value: '{{resolve "customer.trespass.witnessedBy" property="firstName"}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.lastName',
    value: '{{resolve "customer.trespass.witnessedBy" property="lastName"}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.fullName',
    value: '{{resolve "customer.trespass.witnessedBy" property="fullName"}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.barcode',
    value: '{{resolve "customer.trespass.witnessedBy" property="barcode"}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.phone',
    value: '{{resolve "customer.trespass.witnessedBy" property="phone"}}'
  },
  { 
    label: 'customer.trespass.witnessedBy.email',
    value: '{{resolve "customer.trespass.witnessedBy" property="email"}}'
  },
  // { 
  //   label: 'customer.trespass.witnessedBy.role',
  //   value: '{{resolve "customer.trespass.witnessedBy" property="role"}}'
  // },

  // Incident level keys:
  // {
  //   label: 'createdBy.firstName',
  //   value: '{{createdBy.firstName}}'
  // },
  // {
  //   label: 'createdBy.lastName',
  //   value: '{{createdBy.lastName}}'
  // },
  // {
  //   label: 'dateTimeOfIncident',
  //   value: '{{dateTimeOfIncident}}'
  // },
  // {
  //   label: 'detailedDescriptionOfIncident',
  //   value: '{{detailedDescriptionOfIncident}}'
  // },
  {
    label: 'incidentLocation',
    value: '{{formatLocation incident.incidentLocation}}'
  },
  // {
  //   label: 'subLocation',
  //   value: '{{subLocation}}'
  // },

  
  {
    label: 'incidentTypes.description',
    value: '{{resolveIncTypes "incident.incidentTypes.description"}}'
  },
  {
    label: 'incidentTypes.title',
    value: '{{resolveIncTypes "incident.incidentTypes.title"}}'
  },
  
  // {
  //   label: 'incidentWitnesses.firstName',
  //   value: '{{incidentWitnesses.firstName}}'
  // },
  // {
  //   label: 'incidentWitnesses.lastName', 
  //   value: '{{incidentWitnesses.lastName}}'
  // },
  // {
  //   label: 'incidentWitnesses.barcode',
  //   value: '{{incidentWitnesses.barcode}}'
  // },
  // {
  //   label: 'incidentWitnesses.phone',
  //   value: '{{incidentWitnesses.phone}}'
  // },
  // {
  //   label: 'incidentWitnesses.email',
  //   value: '{{incidentWitnesses.email}}'
  // },
  // {
  //   label: 'incidentWitnesses.role',
  //   value: '{{incidentWitnesses.role}}'
  // },

  // START Customer object level keys
  // { 
  //   label: 'customer.barcode',
  //   value: '{{customer.barcode}}'
  // },
  // { 
  //   label: 'customer.description',
  //   value: '{{customer.description}}'
  // },

  // { 
  //   label: 'customer.details.city',
  //   value: '{{customer.details.city}}'
  // },
  // { 
  //   label: 'customer.details.descriptionOfCustomerAtOccurrence',
  //   value: '{{customer.details.descriptionOfCustomerAtOccurrence}}'
  // },
  // { 
  //   label: 'customer.details.eyes',
  //   value: '{{customer.details.eyes}}'
  // },
  // { 
  //   label: 'customer.details.hair',
  //   value: '{{customer.details.hair}}'
  // },
  // { 
  //   label: 'customer.details.height',
  //   value: '{{customer.details.height}}'
  // },
  // { 
  //   label: 'customer.details.race',
  //   value: '{{customer.details.race}}'
  // },
  // { 
  //   label: 'customer.details.sex',
  //   value: '{{customer.details.sex}}'
  // },
  // { 
  //   label: 'customer.details.state',
  //   value: '{{customer.details.state}}'
  // },
  // { 
  //   label: 'customer.details.streetAddress',
  //   value: '{{customer.details.streetAddress}}'
  // },
  // { 
  //   label: 'customer.details.weight',
  //   value: '{{customer.details.weight}}'
  // },
  // { 
  //   label: 'customer.details.zipcode',
  //   value: '{{customer.details.zipcode}}'
  // },

  // { 
  //   label: 'customer.firstName',
  //   value: '{{customer.firstName}}'
  // },
  // { 
  //   label: 'customer.lastName',
  //   value: '{{customer.lastName}}'
  // },
  // { 
  //   label: 'customer.trespass.dateOfOccurrence',
  //   value: '{{customer.trespass.dateOfOccurrence}}'
  // },
  // { 
  //   label: 'customer.trespass.declarationOfService.date',
  //   value: '{{customer.trespass.declarationOfService.date}}'
  // },
  // { 
  //   label: 'customer.trespass.declarationOfService.placeSigned',
  //   value: '{{customer.trespass.declarationOfService.placeSigned}}'
  // },
  // { 
  //   label: 'customer.trespass.declarationOfService.signature',
  //   value: '{{customer.trespass.declarationOfService.signature}}'
  // },
  // { 
  //   label: 'customer.trespass.declarationOfService.title',
  //   value: '{{customer.trespass.declarationOfService.title}}'
  // },
  // { 
  //   label: 'customer.trespass.descriptionOfOccurrence',
  //   value: '{{customer.trespass.descriptionOfOccurrence}}'
  // },
  // { 
  //   label: 'customer.trespass.endDateOfTrespass',
  //   value: '{{customer.trespass.endDateOfTrespass}}'
  // },
  // { 
  //   label: 'customer.trespass.exclusionOrTrespassBasedOn',
  //   value: '{{customer.trespass.exclusionOrTrespassBasedOn}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy',
  //   value: '{{customer.trespass.witnessedBy}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.firstName',
  //   value: '{{customer.trespass.witnessedBy.firstName}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.lastName',
  //   value: '{{customer.trespass.witnessedBy.lastName}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.barcode',
  //   value: '{{customer.trespass.witnessedBy.barcode}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.phone',
  //   value: '{{customer.trespass.witnessedBy.phone}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.email',
  //   value: '{{customer.trespass.witnessedBy.email}}'
  // },
  // { 
  //   label: 'customer.trespass.witnessedBy.role',
  //   value: '{{customer.trespass.witnessedBy.role}}'
  // },
  // END customer object keys
];



 // key/values for map/match in preview
export const tokenValues = {

  '{{declarationOfServiceIssuedBy}}': 'Brooks, Nicole',

  // Incident level keys:
  // '{{createdBy.firstName}}': 'Jane',
  // '{{createdBy.lastName}}': 'Smith',
  // '{{dateTimeOfIncident}}': `${todayDate}`,
  // '{{detailedDescriptionOfIncident}}': 'Description of incident',
  '{{formatLocation incident.incidentLocation}}': 'Central',
  // '{{subLocation}}': 'Second floor',

  '{{resolveIncTypes "incident.incidentTypes.description"}}': 'The incident type description',

  '{{resolveIncTypes "incident.incidentTypes.title"}}': 'The incident type title',

  // '{{incidentWitnesses.firstName}}': 'Joan',
  // '{{incidentWitnesses.lastName}}': 'Smythe',
  // '{{incidentWitnesses.barcode}}': '888085241068',
  // '{{incidentWitnesses.phone}}': '509-444-5300',
  // '{{incidentWitnesses.email}}': 'smythe.none@none.com',
  // '{{incidentWitnesses.role}}': 'Security',

  // START customer object keys
  '{{resolve "customer.barcode"}}': '233233PBQ144144',
  '{{resolve "customer.description"}}': 'a customer description',
  '{{resolve "customer.details.city"}}': 'Spokane',
  // '{{resolve "customer.details.descriptionOfCustomerAtOccurrence"}}': 'a customer description at occurrence',
  '{{resolve "customer.details.eyes"}}': 'eye color',
  '{{resolve "customer.details.hair"}}': 'hair color',
  '{{resolve "customer.details.height"}}': 'customer height',
  '{{resolve "customer.details.race"}}': 'customer race',
  '{{resolve "customer.details.sex"}}': 'customer sex',
  '{{resolve "customer.details.state"}}': 'Washington',
  '{{resolve "customer.details.streetAddress"}}': '402 W Main Ave',
  '{{resolve "customer.details.weight"}}': 'customer weight',
  '{{resolve "customer.details.zipcode"}}': '99201',
  '{{resolve "customer.firstName"}}': 'John',
  '{{resolve "customer.lastName"}}': 'Smith',
  '{{resolve "customer.fullName"}}': 'Smith, John',

  '{{formatDate (resolve "customer.trespass.dateOfOccurrence")}}': `${todayDate}`,

  '{{formatDate (resolve "customer.trespass.declarationOfService.date")}}': `${todayDate}`,
  '{{formatLocation customer.trespass.declarationOfService.placeSigned}}': 'Central',
  '{{resolve "customer.trespass.declarationOfService.signature"}}': 'true',
  '{{resolve "customer.trespass.declarationOfService.title"}}': 'Manager name and title',

  '{{{trespassDescriptionPlain}}}': 'Description of occurrence',

  '{{formatDate (resolve "customer.trespass.endDateOfTrespass")}}': `${twoWeeksFromTodayDate}`,
  // '{{resolve "customer.trespass.exclusionOrTrespassBasedOn"}}': 'Customer behavior',
  '{{resolveTrespassReasons customer.trespass.exclusionOrTrespassBasedOn}}': 'Customer behavior',
  '{{resolve "customer.trespass.witnessedBy" property="firstName"}}': 'Joan',
  '{{resolve "customer.trespass.witnessedBy" property="lastName"}}': 'Smythe',
  '{{resolve "customer.trespass.witnessedBy" property="fullName"}}': 'Smythe, Joan',
  '{{resolve "customer.trespass.witnessedBy" property="barcode"}}': '888085241068',
  '{{resolve "customer.trespass.witnessedBy" property="phone"}}': '509-444-5300',
  '{{resolve "customer.trespass.witnessedBy" property="email"}}': 'smythe.none@none.com',
  '{{resolve "customer.trespass.witnessedBy" property="role"}}': 'Security',
  // END customer object keys
};

