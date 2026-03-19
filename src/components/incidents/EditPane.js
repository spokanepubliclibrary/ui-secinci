import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useParams, useHistory, useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import {
  Accordion,
  AccordionSet,
  Button,
  Checkbox,
  Col,
  Datepicker,
  Editor,
  ExpandAllButton,
  Icon,
  KeyValue,
  Label,
  List,
  LoadingPane,
  MessageBanner,
  MetaSection,
  Pane,
  PaneHeader,
  PaneFooter,
  Row,
  Select,
  Timepicker,
} from '@folio/stripes/components';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import ModalSelectKnownCustomer from './ModalSelectKnownCustomer';
import ModalDescribeCustomer from './ModalDescribeCustomer';
import ModalSelectIncidentTypes from './ModalSelectIncidentTypes';
import ModalSelectWitness from './ModalSelectWitness';
import ModalTrespass from './ModalTrespass';
import ModalCustomerDetails from './ModalCustomerDetails';
import ModalAddMedia from './ModalAddMedia';
import CreateMedia from './CreateMedia';
import parseMMDDYYYY from './helpers/parseMMDDYYYY';
import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
import convertUTCISOToLocalePrettyTime from './helpers/convertUTCISOToLocalePrettyTime';
// formats to local date at midnight and one second in UTC ISO:
import formatDateToUTCISO from './helpers/formatDateToUTCISO'; 
import formatDateAndTimeToUTCISO from './helpers/formatDateAndTimeToUTCISO';
import isValidDateFormat from './helpers/isValidDateFormat';
import isValidTimeInput from './helpers/isValidTimeInput';
import stripHTML from './helpers/stripHTML';
import getTodayDate from './helpers/getTodayDate';
import { isSameHtml } from './helpers/isSameHtml.js';
import GetDetails from './GetDetails';
import GetSelf from './GetSelf';
import GetMedia from './GetMedia';
import GetName from './GetName';
import GetNameCreatedBy from './GetNameCreatedBy';
import identifyCurrentTrespassDocs from './helpers/identifyCurrentTrespassDocs';
import Thumbnail from './Thumbnail';
import ThumbnailSkeleton from './ThumbnailSkeleton';
import ThumbnailMarkRemoval from './ThumbnailMarkRemoval'; 
import ThumbnailTempPreSave from './ThumbnailTempPreSave';
import UpdateReport from './UpdateReport';
import makeId from '../../settings/helpers/makeId';
import ModalCustomWitness from './ModalCustomWitness';
import GetTrespassTemplates from '../../settings/GetTrespassTemplates';
import GetTrespassReasons from '../../settings/GetTrespassReasons';
import hasTopLevelFormChanged from './helpers/hasTopLevelFormChanged.js';
import hasTopLevelChangeAffectedDeclaration from './helpers/hasTopLevelChangeAffectedDeclaration.js'; 
import computeEditedCustomers from './helpers/computeEditedCustomers.js';
import sortTrespassDocuments from './helpers/sortTrespassDocuments.js';
import ModalDirtyFormWarn from './ModalDirtyFormWarn.js';
import ModalAttentionDecOfService from './ModalAttentionDecOfService.js';
import ModalLinkIncident from './ModalLinkIncident.js';
import GetSummary from './GetSummary.js';
import LinkedIncident from './LinkedIncident.js';
import { useIncidents } from '../../contexts/IncidentContext';
import {
  generateTrespassDocumentsAtEdit,
  generatePDFAttachments
} from './helpers/trespassDocUtils.js';

const EditPane = () => {
  const history = useHistory();
  const intl = useIntl();
  const location = useLocation();
  const searchRef = useRef(location.search);
  const draftRef = useRef(''); // local unsanitized buffer - doesn't trigger React re-renders
  const {
    singleIncident,
    closeEditPane,
    openModalSelectTypes,
    openModalUnknownCust,
    openModalSelectKnownCust,
    selectedCustomers, // customers selected for saving
    setSelectedCustomers, 
    selectedWitnesses,
    setSelectedWitnesses,
    openModalSelectWitness,
    self,
    openModalTrespass,
    isLoadingDetails,
    openLoadingDetails,
    isUpdatingReport, 
    setIsUpdatingReport,
    openModalMedia,
    setAttachmentsData, // UpdateReport passes attachmentsData to CreateMedia
    idForMediaCreate,
    setIdForMediaCreate,
    formDataArrayForMediaCreate, 
    setFormDataArrayForMediaCreate,
    openModalCustomerDetails,
    locationsInService,
    incidentTypesList,
    isImageArrayLoading, 
    openImageSkeleton, // set isImageArrayLoading to true
    // closeImageSkeleton, // set isImageArrayLoading to false
    openModalCustomWitness,
    trespassTemplates,
    triggerDocumentError,
    trespassReasons
  } = useIncidents();

  const { id } = useParams();
  useEffect(() => {
    if (id) {
      openLoadingDetails();
    }
  }, [id]);

  const allowedReasonsById = useMemo(() => {
    const list = (trespassReasons ?? []).filter(r => !r.isSuppressed);
    return new Map(list.map(r => [r.id, r]));
  }, [trespassReasons])

  const defaultReason = useMemo(() => {
    const r = (trespassReasons ?? []).find(x => x.isDefault && !x.isSuppressed);
    return r ? { id: r.id, reason: r.reason } : null;
  }, [trespassReasons]);

  /**
   * - sanitizeReasons()
   * - leveraged on any customer that is getting 'update declaration'
   * - removes suppressed/deleted reasons (not in allowedReasonsById)
   * - normalizes label to the current configs reason text
   * - dedupes by id
   * - optionally inserts a default reason if we stripped everything (shouldn't happen via UI process, but covering dark corner case...)
   *   AND the customer used to have at least one reason.
  */
  const sanitizeReasons = useCallback((arr, allowedMap) => {
    const seen = new Set();
    const out = [];
    for (const item of (arr || [])) {
      const id = typeof item === 'string' ? item : item?.id;
      if (!id) continue;

      const allowed = allowedMap.get(id); // undefined => suppressed or deleted
      if (!allowed) continue;

      if (seen.has(id)) continue;
      seen.add(id);

      // normalize to current wording in settings
      out.push({ id, reason: allowed.reason });
    };

    return { sanitized: out, hadAnyBefore: (arr?.length ?? 0) > 0 };
  }, []);

  const [showModalLinkIncident, setShowModalLinkIncident] = useState(false);
  const [linkedToSummaries, setLinkedToSummaries] = useState([]); // summaries built from 'allLinkedTo' via 'idsArray' memo
  const [allLinkedTo, setAllLinkedTo] = useState(() => new Set()); // merging of record/selected
  const [trespassCustomerID, setTrespassCustomerID] = useState(null);
  const [detailsCustomerID, setDetailsCustomerID] = useState(null);
  const [putData, setPutData] = useState({});
  const [subLocationsDataOptions, setSubLocationsDataOptions] = useState([]);
  const [unsavedMediaArray, setUnsavedMediaArray] = useState([]);
  const [mediaArray, setMediaArray] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [mostCurrentTrespassDocIds, setMostCurrentTrespassDocIds] = useState([]);
  const [mediaSrc, setMediaSrc] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({});
  const [removedCustomerIds, setRemovedCustomerIds] = useState([]);
  const [removedWitnessIds, setRemovedWitnessIds] = useState([]);
  const [associatedKeyCustArray, setAssociatedKeyCustArray] = useState([]);
  const [associatedKeyWitArray, setAssociatedKeyWitArray] = useState([]);
  const [allWitnesses, setAllWitnesses] = useState([]);
  const [custWitEditObj, setCustWitEditObj] = useState({});
  const [custWitEditID, setCustWitEditID] = useState('');
  const [allCustomers, setAllCustomers] = useState([]);
  const [isNoCustomer, setIsNoCustomer] = useState(false);
  const [trespassTemplate, setTrespassTemplate] = useState('');
  const [createdById, setCreatedById] = useState('');
  const [updatedById, setUpdatedById] = useState('');
  const [missingUsers, setMissingUsers] = useState([]);
  const [stagedTrespassMap, setStagedTrespassMap] = useState(new Map()); // trespass objects set to be updated
  const [showDirtyFormModal, setShowDirtyFormModal] = useState(false);
  const [customersToUpdateDeclaration, setCustomersToUpdateDeclaration] = useState([]); // customers that have UI 'Update declaration' checked
  const [isModalAttentionDecOfService, setIsModalAttentionDecOfService] = useState(false);
  const [customersWithoutDeclaration, setCustomersWithoutDeclaration] = useState(new Set()); // persisted data customers with no declaration of service
  const [originalDeclarationCustomerIds, setOriginalDeclarationCustomerIds] = useState(new Set()); // persisted data customers that have a declaration of service
  const [isHydrated, setIsHydrated] = useState(false);
  const [createdByForRender, setCreatedByForRender] = useState({
    id: '',
    barcode: '',
    firstName: '',
    lastName: ''
  }); 
  const [updatedByForRender, setUpdatedByForRender] = useState({
    id: '',
    barcode: '',
    firstName: '',
    lastName: ''
  }); 
  const [formData, setFormData] = useState({
    customerNa: false,
    customers: [],
    incidentLocation: '',
    subLocation: '',
    dateTimeOfIncident: '', // feeds timeOfIncident key
    timeOfIncident: '', // ui only key, does not persist in db
    isApproximateTime: false,
    detailedDescriptionOfIncident: '',
    incidentWitnesses: [],
    incidentTypes: [],
    attachments: [],
    id: '',
    metadata: {},
    staffSuppressed: undefined,
    linkedTo: [],
  });

  const defaultFormData = {
    customerNa: false,
    customers: [],
    incidentLocation: '',
    subLocation: '',
    dateTimeOfIncident: '',
    timeOfIncident: '',
    isApproximateTime: false,
    detailedDescriptionOfIncident: '',
    incidentWitnesses: [],
    incidentTypes: [],
    attachments: [],
    id: '',
    metadata: {},
    staffSuppressed: false,
    linkedTo: [],
  };

  const initialFormData = useMemo(() => {
    if (!singleIncident || Object.keys(singleIncident).length === 0) {
      return defaultFormData;
    };
    return {
      customerNa: singleIncident?.customerNa,
      customers: singleIncident?.customers || [],
      incidentLocation: singleIncident.incidentLocation || '',
      subLocation: singleIncident.subLocation || '',
      dateTimeOfIncident: convertUTCISOToPrettyDate(singleIncident.dateTimeOfIncident) || '',
      timeOfIncident: convertUTCISOToLocalePrettyTime(singleIncident.dateTimeOfIncident) || '',
      isApproximateTime: singleIncident.isApproximateTime || false,
      detailedDescriptionOfIncident: singleIncident.detailedDescriptionOfIncident || '',
      incidentWitnesses: singleIncident?.incidentWitnesses || [],
      incidentTypes: [...(singleIncident.incidentTypes || [])],
      attachments: singleIncident.attachments || [],
      id: singleIncident.id || '',
      metadata: singleIncident.metadata,
      staffSuppressed: singleIncident?.staffSuppressed || false,
      linkedTo: singleIncident?.linkedTo || [],
    };
  }, [singleIncident]);

  // keep track of which incident has been hydrated.
  // prevents resetting formData every time initialFormData changes identity
  // (e.g. modal openings). we only hydrate when incident ID
  // changes, not when props produce a new object reference for the useEffect
  const currentId = singleIncident?.id || '';
  const hydratedIdRef = useRef(null);
  useEffect(() => {
    if (hydratedIdRef.current !== currentId) {
      setFormData(initialFormData);
      setAllLinkedTo(new Set((initialFormData.linkedTo || []).map(String)));
      setIsHydrated(true);
      hydratedIdRef.current = currentId;
    }
  }, [currentId]);

  const idsArray = useMemo(
    () => Array.from(allLinkedTo).sort(),
    [allLinkedTo]
  );

  useEffect(() => {
    if (singleIncident?.customers?.length) {
      const ids = singleIncident.customers
        .filter(cust => !cust.trespass?.declarationOfService)
        .map(cust => cust.id);

      setCustomersWithoutDeclaration(new Set(ids));
    }
  }, [singleIncident]);

  useEffect(() => {
    if (singleIncident?.customers?.length) {
      const ids = singleIncident.customers
        .filter(cust => cust.trespass?.declarationOfService)
        .map(cust => cust.id);

      setOriginalDeclarationCustomerIds(new Set(ids));
    }
  }, [singleIncident]);

  const staffSuppressedIsDirty = useMemo(
    () => isHydrated && (formData.staffSuppressed !== initialFormData.staffSuppressed),
    [isHydrated, formData.staffSuppressed, initialFormData.staffSuppressed]
  );

  const topLevelIsDirty = useMemo(() => {
    if (!isHydrated) return; 
    return hasTopLevelFormChanged(
      formData, 
      initialFormData, 
      selectedCustomers, 
      selectedWitnesses, 
      unsavedMediaArray,
      customersToUpdateDeclaration
    );
  }, [
    isHydrated,
    formData, 
    initialFormData, 
    selectedCustomers, 
    selectedWitnesses, 
    unsavedMediaArray,
    customersToUpdateDeclaration
  ]);

  const linkedDirty = useMemo(() => {
    const initial = new Set((initialFormData.linkedTo || []).map(String));
    if (initial.size !== allLinkedTo.size) return true;
    for (const id of allLinkedTo) {
      if (!initial.has(String(id))) return true;
    }
    return false;
  }, [initialFormData.linkedTo, allLinkedTo]);


  // which customers changed at the per-customer level
  const editedCustomerIDs = useMemo(() => {
    if (!isHydrated || !allCustomers || allCustomers.length === 0) return new Set();

    return computeEditedCustomers(initialFormData, allCustomers);
  }, [isHydrated, initialFormData.customers, allCustomers]);

  const formIsDirty = useMemo(
    () => isHydrated && (topLevelIsDirty || 
        editedCustomerIDs.size > 0 || 
        linkedDirty),
    [isHydrated, topLevelIsDirty, editedCustomerIDs, linkedDirty]
  );

  const _hasCurrentDeclaration = useCallback(
    (cust) => Boolean(cust?.trespass?.declarationOfService),
    []
  );

  const _isNewlyAddedDeclaration = useCallback(
    (cust) => _hasCurrentDeclaration(cust) && !originalDeclarationCustomerIds.has(cust.id),
    [originalDeclarationCustomerIds, _hasCurrentDeclaration]
  );

  const topLevelAffectsDeclaration = useMemo(() => {
    if (!isHydrated) return false;
    return hasTopLevelChangeAffectedDeclaration(
      initialFormData,
      formData,  
      selectedWitnesses, 
      unsavedMediaArray
    );
  }, [
    isHydrated, 
    initialFormData,
    formData,  
    selectedWitnesses, 
    unsavedMediaArray
  ]);

  // determine who must opt-in via 'Update declaration' if wanting persist DoS and new document generated
  const requiredIds = useMemo(() => {
    if (topLevelAffectsDeclaration) {
      // global 'Update declaration' only when fields taht affect docs changed
      return new Set(originalDeclarationCustomerIds);
    };
    // per-customer path
    // only edited customers who originally had DoS
    const set = new Set();
    for (const id of editedCustomerIDs) {
      if (originalDeclarationCustomerIds.has(id)) set.add(id);
    }
    return set;
  }, [ 
    originalDeclarationCustomerIds, 
    editedCustomerIDs, 
    topLevelAffectsDeclaration
  ]);
  
  // who is required but not checked in list via 'update declaration'
  const missingIds = useMemo(() => {
    const allow = new Set(customersToUpdateDeclaration);
    return [...requiredIds].filter(id => !allow.has(id))
  }, [requiredIds, customersToUpdateDeclaration]);

  const handleStagedTrespassUpdate = useCallback((custId, trespassData) => {
    setStagedTrespassMap(prev => {
      const next = new Map(prev);
      next.set(custId, trespassData);
      return next;
    });
  }, []);

  const handleUpdateDeclaration = useCallback((custId) => {
    setCustomersToUpdateDeclaration((prevArray) => {
      if (prevArray.includes(custId)) {
        return prevArray.filter(c => c !== custId);
      } else {
        return [...prevArray, custId];
      }
    });
  }, []);

  const handleClickNo = () => {
    handleSubmit();
  };

  const handlClickYes = () => {
    setIsModalAttentionDecOfService(false);
  };

  useEffect(() => {
    if (trespassTemplates) {
      const defaultTemplate = trespassTemplates.find((template) => {
        return template.isDefault === true;
      });
      if (defaultTemplate) {
        const templateValue = defaultTemplate.templateValue
        setTrespassTemplate(templateValue)
      };
    };
  }, [trespassTemplates]);

  useEffect(() => {
    setIsNoCustomer(formData.customerNa)
  }, [formData.customerNa]);

  useEffect(() => {
    if(formData.metadata && 'createdByUserId' in formData.metadata && formData.metadata.createdByUserId !== '') {
      setCreatedById(formData.metadata.createdByUserId)
    }
  }, [formData, formData.metadata]);

  useEffect(() => {
    if(formData.metadata && 'updatedByUserId' in formData.metadata && formData.metadata.updatedByUserId !== '') {
      setUpdatedById(formData.metadata.updatedByUserId)
    }
  }, [formData, formData.metadata]);

  useEffect(() => {
    if(formData.attachments && formData.attachments.length > 0) {
      const docs = formData.attachments.filter((att) => att.contentType.startsWith('application'));
      setDocuments(docs);
      const medias = formData.attachments.filter((att) => att.contentType.startsWith('image') || att.contentType.startsWith('video'));
      setMediaArray(medias);
      const newLoadingStatus = medias.reduce((acc, att) => ({
        ...acc,
        [att.id]: loadingStatus[att.id] !== false // retain prev load status
        ? true  // start as loading if not already set
        : false
      }), {});
      setLoadingStatus(newLoadingStatus);
      openImageSkeleton();
    }
  }, [formData.attachments])

  const sortedDocuments = useMemo(() => sortTrespassDocuments(documents, mostCurrentTrespassDocIds), [documents, mostCurrentTrespassDocIds]);

  const handleAddMedia = (mediaObj) => {
    const readyMediaObj = {
      ...mediaObj,
      id: makeId(mediaObj.description),
      description: mediaObj.description.trim()
      
    };
    setUnsavedMediaArray((prev) => [
      ...prev,
      readyMediaObj
    ]);
  };

  const handleRemoveUnsavedMedia = (unsavedId) => {
    const updatedUnsavedMediaArray = unsavedMediaArray.filter((obj) => obj.id !== unsavedId)
    setUnsavedMediaArray(updatedUnsavedMediaArray);
  };

  const handleMediaUrl = (mediaUrl, attachmentId) => {
    setMediaSrc(prev => ({ ...prev, [attachmentId]: mediaUrl }));
    setLoadingStatus(prev => ({ ...prev, [attachmentId]: false }));
  };

  useEffect(() => {
    if (documents && documents.length > 0) {
      const startStr = 'trespass-';
      const current = identifyCurrentTrespassDocs(documents, startStr);
      setMostCurrentTrespassDocIds(current);
    }
  }, [documents]);

  const thumbnailStyle = { width: '100px', height: 'auto', objectFit: 'cover'};

  const handleMissingUsers = (userId) => {
    setMissingUsers((prev) => {
     return [ ...prev, userId]
    })
  };

  const handleCloseEdit = () => {
    setCreatedByForRender({
      id: '',
      barcode: '',
      firstName: '',
      lastName: ''
    });
    setUpdatedByForRender({
      id: '',
      barcode: '',
      firstName: '',
      lastName: ''
    });
    setCreatedById('');
    setUpdatedById('');
    setSelectedCustomers([]);
    setSelectedWitnesses([]);
    setMissingUsers([]);
    setIdForMediaCreate(null);
    setFormDataArrayForMediaCreate(null);
    setCustomersToUpdateDeclaration([]);
    closeEditPane();
    history.replace(`/incidents/${id}${searchRef.current}`);
  };

  const anyDirty = formIsDirty || staffSuppressedIsDirty;
  const handleClickDismissCancel = () => {
    if (anyDirty) {
      setShowDirtyFormModal(true);
    } else {
      handleCloseEdit();
    };
  };

  const handleKeepEditing = () => {
    setShowDirtyFormModal(false);
  };

  const handleDismissOnDirty = () => {
    handleCloseEdit();
  };

  const clearSubLocation = () => {
    setFormData({
      ...formData,
      subLocation: '',
    });
  };

  const handleOpenModalLinkIncident = () => {
    setShowModalLinkIncident(true)
  };

  const handleCloseModalLinkIncident = () => {
    setShowModalLinkIncident(false)
  };

  const toggleRowChecked = useCallback((id) => {
    setAllLinkedTo(prev => {
      const nextSet = new Set(prev);
      nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
      return nextSet; 
    })
  }, []);

  const handleTrashLinkedIncident = (toDeleteId) => {
    toggleRowChecked(toDeleteId)
  };

  const locationDataOptions = useMemo(() => {
    const defaultValueLabel = [{ 
      value: '', 
      label: <FormattedMessage 
          id="create-pane.locationDataOptions-label-select-location"/> 
      }];
    const formattedLocations = locationsInService 
      ? locationsInService.map((loc) => ({
          // <Select /> to match current inst loc.id to pretty name
          value: loc.id, 
          label: loc.location,
          subLocations: loc.subLocations ? loc.subLocations : []
        }))
      : [{ 
        value: '', 
        label: <FormattedMessage 
          id="create-pane.locationDataOptions-label-no-loaded"/> 
        }];
    return [
      ...defaultValueLabel,
      ...formattedLocations,
    ];
  }, [locationsInService]);

  const runSubLocationsSelect = useCallback((value) => {
    let subLocs;
    let options;
    const noSubLocationOption = [{ 
      value: 'No sub-location', 
      label: <FormattedMessage 
        id="create-pane.subLocations-label-default-no-sub-location"/> 
    }]; 
    const noValueLabel = [{ 
      value: '', 
      label: <FormattedMessage 
        id="create-pane.subLocations-label-no-sub-location-available"
      /> 
    }]; 

    // ensure initialization of locationDataOptions
    const currentValue = Array.isArray(locationDataOptions) 
      ? locationDataOptions.find((loc) => loc.value === value)
      : undefined;

    // ensure initialization of currentValue.subLocations
    if (currentValue && Array.isArray(currentValue.subLocations) && currentValue.subLocations.length > 0) {
      subLocs = currentValue.subLocations.map((sub) => {
        return { value: sub.name, label: `${sub.name} - ${sub.description}` };
      });
      options = [...noSubLocationOption, ...subLocs];
    } else {
      options = [...noValueLabel];
    };
    setSubLocationsDataOptions(options);
  }, [locationDataOptions]);

  useEffect(() => {
    // for initial rendering the current instance subLocation value in Select
    // dependency of once locationDataOptions has been set
    runSubLocationsSelect(formData.incidentLocation);
  }, [locationDataOptions, formData.incidentLocation, runSubLocationsSelect]);

  const handleChange = (eventOrValue) => {
    let name;
    let value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (eventOrValue && eventOrValue.target) {
      ({ name, value } = eventOrValue.target);

      if (eventOrValue.target.type === 'checkbox') {
        value = eventOrValue.target.checked;
      }
    } else {
      // if no 'target' property in custom component such as
      // ( has array of selected options, not event object)
      name = 'incidentWitnesses';
      value = eventOrValue;
    }
    if (
      name === 'customerDetails.firstName' ||
      name === 'customerDetails.lastName'
    ) {
      const key = name.split('.')[1];

      setFormData((prev) => ({
        ...prev,
        customerDetails: {
          ...prev.customerDetails,
          [key]: value,
        },
      }));
    }
    if (name === 'incidentWitnesses') {
      const selectedRoles = value.map((item) => item.value);
      const updatedWitnesses = formData.incidentWitnesses.map((witness) => ({
        ...witness,
        selected: selectedRoles.includes(witness.role),
      }));
      setFormData((prev) => ({
        ...prev,
        incidentWitnesses: updatedWitnesses,
      }));
    }
    if (name === 'incidentLocation') {
      clearSubLocation();
      runSubLocationsSelect(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } 
    if (name === 'dateTimeOfIncident') {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  useEffect(() => {
    draftRef.current = formData.detailedDescriptionOfIncident || '';
  }, [formData.detailedDescriptionOfIncident])

  // fires on every key-press but only mutates the ref
  const handleDescriptionChange = (content) => {
    draftRef.current = content; 
  };

  // commits once, with sanitized HTML
  const handleEditorBlur = () => {
    const sanitizedContent = DOMPurify.sanitize(draftRef.current);
    setFormData(prev =>
      isSameHtml(prev.detailedDescriptionOfIncident, sanitizedContent)
      ? prev
      : { ...prev, detailedDescriptionOfIncident: sanitizedContent }
    );
  };

  const handleEditorKeyDown = (e) => {
    if (e.key === 'Tab') {
      handleEditorBlur(); // force commit when user tabs out
    }
  };

  const handleGetWitnessName = (witObj) => {
    setAssociatedKeyWitArray((prevState) => {
      return [...prevState, witObj]
    })
  };

  useEffect(() => {
    if(associatedKeyWitArray && associatedKeyWitArray.length > 0) {
      const readyDataWitnesses = formData.incidentWitnesses.map((dataObj) => {
        const matchingWit = associatedKeyWitArray.find(
          (wit) => wit.id === dataObj.id
        );
        if(matchingWit) {
          return {
            ...dataObj,
            associatedFirstName: matchingWit.firstName,
            associatedLastName: matchingWit.lastName
          };
        }
        return dataObj;
      });
      setFormData(prev => ({
        ...prev,
        incidentWitnesses: readyDataWitnesses
      }))
    }
  }, [associatedKeyWitArray]);

  useEffect(() => {
    const witnessesSet = new Set(
      [...formData.incidentWitnesses, ...selectedWitnesses].map((wit) => 
        JSON.stringify(wit)
      )
    );
    const mergedNoDuplicateWitnesses = Array.from(witnessesSet).map((wit) =>
      JSON.parse(wit)
    );
    setAllWitnesses(mergedNoDuplicateWitnesses)
  }, [formData.incidentWitnesses, selectedWitnesses]);
  
  const handleGetCustName = (userObj) => {
    setAssociatedKeyCustArray((prevState) => {
      return [...prevState, userObj];
    })
  };

  useEffect(() => {
  // handle non registered customers to bypass setting associated key names
    singleIncident.customers?.forEach((cust) => {
      if (cust.registered === false) {
        handleGetCustName(cust); 
      }
    });
  }, [singleIncident.customers]);

  useEffect(() => {
    // handle registered customers to add in temporary key/values for rendering name based on associated keys
    if(associatedKeyCustArray && associatedKeyCustArray.length > 0) {
      const readyDataCustomers = formData.customers.map((dataObj) => {
        const matchingCust = associatedKeyCustArray.find(
          (cust) => cust.id === dataObj.id 
        );
        if (matchingCust) {
          return {
            ...dataObj,
            associatedFirstName: matchingCust.firstName,
            associatedLastName: matchingCust.lastName
          };
        };
        return dataObj;
      });
      setFormData(prev => ({
        ...prev,
        customers: readyDataCustomers
      }))
    };
  }, [associatedKeyCustArray]);


  /* 
    effect ensures that allCustomers always refelcts the most recently
    edited customer data. 
    it merges customer info from prevAllCustomers, formData.customers, and selectedCustomers, 
    always preferring latest version for each customer (formData > selected > prev).
    only the trespass field is conditionally updated from stagedTrespassMap.
    this prevents stale data from overwriting recent edits, 
    especially after ModalTrespass.js save/submit (fix: which previously fired downstream 
    events to unexpectedly wipe ModalCustomerDetails.js edits).
  */
  useEffect(() => {
    if (!isHydrated) return;
    setAllCustomers(prevAllCustomers => {
      // previous state, keyed by id
      const prevMap = new Map(prevAllCustomers.map(c => [c.id, c]));
      // build the new list de-duped by id, while merging fields
      const byId = new Map();

      // helper to merge staged trespass, but preserve all other fields from prevAllCustomers
      const mergeOne = (cust) => {
        if (!cust || !cust.id) return;
        const existing = prevMap.get(cust.id) || cust;
        const stagedTrespass = stagedTrespassMap.get(cust.id);

        // only update trespass if staged otherwise keep everything else as last edited
        const merged = {
          ...existing,
          trespass: stagedTrespass !== undefined ? stagedTrespass : existing.trespass,
        };

        byId.set(cust.id, merged);
      };

      // always use the union of all customer IDs from previous state, formData, and selectedCustomers
      const allIds = new Set([
        ...prevAllCustomers.map(c => c.id),
        ...formData.customers.map(c => c.id),
        ...selectedCustomers.map(c => c.id),
      ]);

      // for each customer, merge as above
      allIds.forEach(id => {
        // prefer prevAllCustomers as the base
        const prev = prevMap.get(id);
        // find the latest in formData or selectedCustomers if present
        const formCust = formData.customers.find(c => c.id === id);
        const selectedCust = selectedCustomers.find(c => c.id === id);
        // use the most recently edited customer object, falling back to prev
        const baseCust = formCust || selectedCust || prev;
        mergeOne(baseCust);
      });

      return Array.from(byId.values());
    });
  }, [isHydrated, formData.customers, selectedCustomers, stagedTrespassMap]);

  const handleRemoveCustomer = (customerId) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      customers: prevFormData.customers.filter(cust => cust.id !== customerId)
    }))
    setSelectedCustomers(prevSelectedCustomers => 
      prevSelectedCustomers.filter(cust => cust.id !== customerId)
    );
    setRemovedCustomerIds(prev => [...prev, customerId]);
  };

  // persisted (original) customers on the incident
  const initialCustomerIds = useMemo(
    () => new Set((initialFormData.customers ?? []).map(c => c.id)),
    [initialFormData.customers]
  );

  // truly new in THIS edit session (not present in initial incident)
  const newlyAddedCustomerIds = useMemo(() => {
    const out = new Set();
    for (const c of allCustomers) {
      if (c?.id && !initialCustomerIds.has(c.id)) out.add(c.id);
    }
    return out;
  }, [allCustomers, initialCustomerIds]);

  const optedSet = useMemo(
    () => new Set(customersToUpdateDeclaration),
    [customersToUpdateDeclaration]
  );

  const isNewlyAddedDoS = (cust) =>
    Boolean(cust.trespass?.declarationOfService) &&
    !originalDeclarationCustomerIds.has(cust.id);

  const willReceiveNewDeclaration = (cust) => {
    const hasDoSNow = Boolean(cust.trespass?.declarationOfService);
    return (
      hasDoSNow &&
      !formData.staffSuppressed &&
      (
        optedSet.has(cust.id) || // user opted-in
        newlyAddedCustomerIds.has(cust.id) || // truly new & with DoS 
        isNewlyAddedDoS(cust) // DoS added this edit
      )
    );
  };
 
  const finalizeSubmission = async (finalCustomersArray) => {
    /*
      For 'detailedDescriptionOfIncident' build that value from draftRef,
      not formData, so we always send the latest text even if user clicks save
      while the Editor still has focus and onBlur hasn't committed the field to state yet. 
      Note that 'detailedDescriptionOfIncident' feeds a trespass object's 'descriptionOfOccurrence' value, which is only seen in the context of raw record or an automated trespass document if that token is chosen for the doc template.
    */
    const cleanedDetailedDescription = DOMPurify.sanitize(draftRef.current);
    // console.log("cleanedDetailedDescription --> ", JSON.stringify(cleanedDetailedDescription, null, 2))

    try {
      // remove temp associated name keys
      const formattedWitnesses = allWitnesses.map(({ associatedFirstName, associatedLastName, ...rest }) => {
        if (rest.isCustom) {
          const { role, phone, email, ...others } = rest;
          
          const trimmedRole = rest.role?.trim();
          const trimmedPhone = rest.phone?.trim();
          const trimmedEmail = rest.email?.trim();
          return {
            ...others,
            ...(trimmedRole ? { role: trimmedRole } : {}),
            ...(trimmedPhone ? { phone: trimmedPhone } : {}),
            ...(trimmedEmail ? { email: trimmedEmail } : {})
          };
        }
        return rest;
      });

      // let for conditional assignment
      let formattedCustomers = finalCustomersArray.map((cust) => {
        let updatedCustomer = { ...cust };
        delete updatedCustomer.associatedFirstName;
        delete updatedCustomer.associatedLastName;

        if (cust.trespass) {
          let reasonPatch = {};
          if (willReceiveNewDeclaration(cust)) {
            const currentReasons = cust.trespass.exclusionOrTrespassBasedOn || [];
            const { sanitized: cleaned, hadAnyBefore } = 
              sanitizeReasons(currentReasons, allowedReasonsById);

            const finalReasons =
              cleaned.length > 0
                ? cleaned
                : (hadAnyBefore && defaultReason ? [defaultReason] : []);

            reasonPatch = { exclusionOrTrespassBasedOn: finalReasons };
          };

          let trespassDesc = cust.trespass.description?.trim();
          updatedCustomer = {
            ...updatedCustomer,
            trespass: {
              ...cust.trespass,
              ...reasonPatch, // only applied when gated in, otherise untouched
              dateOfOccurrence: formatDateToUTCISO(formData.dateTimeOfIncident),
              ...(cust.trespass.endDateOfTrespass
                ? {
                    endDateOfTrespass: formatDateToUTCISO(
                      cust.trespass.endDateOfTrespass
                    ),
                  }
                : {}),
              ...(cust.trespass.declarationOfService
                ? {
                    declarationOfService: {
                      ...cust.trespass.declarationOfService,
                      date: formatDateToUTCISO(
                        cust.trespass.declarationOfService.date
                      ),
                    },
                  }
                : {}),

              // descriptionOfOccurrence: cleanedDetailedDescription.trim(),
              // if custom trespass description exists, use it for both fields
              ...(trespassDesc
                ? {
                  description: DOMPurify.sanitize(trespassDesc),
                  descriptionOfOccurrence: DOMPurify.sanitize(trespassDesc),
                }
              : {
                // default
                descriptionOfOccurrence: cleanedDetailedDescription.trim(),
              }),
              witnessedBy: formattedWitnesses,
            },
          };
        };
        if (cust.details) {
          const { dateOfBirth, ...restDetails } = cust.details;
          updatedCustomer = {
            ...updatedCustomer,
            details: {
              ...restDetails,
              ...(dateOfBirth ? 
                { dateOfBirth: formatDateToUTCISO(cust.details.dateOfBirth) }
                : {}),
            },
          };
        }
        return updatedCustomer;
      });

      const updatedMetadata = {
        createdByUserId: singleIncident.metadata.createdByUserId,
        createdDate: singleIncident.metadata.createdDate,
        updatedByUserId: self.id
      };
      if (formData.customerNa && formattedCustomers.length > 0) {
        formattedCustomers = []
      };
      const data = {
        ...formData,
        detailedDescriptionOfIncident: cleanedDetailedDescription,
        customerNa: formattedCustomers.length > 0 ? false : formData.customerNa,
        customers: formData.customerNa ? [] : formattedCustomers,
        dateTimeOfIncident: formatDateAndTimeToUTCISO(formData.dateTimeOfIncident, formData.timeOfIncident),
        incidentWitnesses: formattedWitnesses, // allWitnesses witnessesList
        id: singleIncident.id,
        createdBy: singleIncident.createdBy,
        metadata: updatedMetadata,
        linkedTo: Array.from(allLinkedTo)
      };
      delete data.timeOfIncident; // is temp UI render key and its value derives from dateTimeOfIncident

    const onlyLinkedChanged = linkedDirty && 
      !topLevelAffectsDeclaration && 
      editedCustomerIDs.size === 0;

    let readyTrespassDocuments = [];
    let trespassDocumentPDFs = [];
    // only generate trespass PDFs if record is not staffSuppressed and not only did linkedTo change
    if (!formData.staffSuppressed && !onlyLinkedChanged) {
      // generate trespass documents
      try {
        const helperDeps = { locationDataOptions, trespassReasons, self, triggerDocumentError};
        const selectedCustomerIds = new Set(selectedCustomers.map(c => c.id));

        readyTrespassDocuments = generateTrespassDocumentsAtEdit(
          formattedCustomers, 
          customersToUpdateDeclaration, // array
          selectedCustomerIds,  // Set
          originalDeclarationCustomerIds, // Set
          // editedCustomerIDs, // Set
          topLevelAffectsDeclaration, // boolean
          data, 
          trespassTemplate, 
          helperDeps
        );
      } catch (error) {
        console.error(`Error at readyTrespassDocuments: ${error}`);
        // triggerDocumentError(`Error in generateTrespassDocuments: ${error}`)
        const errorMsg = error.message;
        triggerDocumentError(<FormattedMessage 
          id="generate-trespass.error-doc-readyTrespassDocuments"
          values={{ error: errorMsg }}
        />)
        readyTrespassDocuments = [];
      };
    
      try {
        // trespassDocumentPDFs = await generatePDFAttachments();
        trespassDocumentPDFs = await generatePDFAttachments(
          readyTrespassDocuments,
          triggerDocumentError
        );
      } catch (error) {
        console.error(`Unexpected error in PDF generation: ${error}`);
        // triggerDocumentError(`Unexpected error in PDF generation: ${error}`)
        const errorMsg = error.message;
        triggerDocumentError(<FormattedMessage 
          id="generate-trespass.error-doc-unexpected-error"
          values={{ error: errorMsg }}
        />)
        trespassDocumentPDFs = [];
      };
    };

    const readyToBeSaved = unsavedMediaArray.map((mediaObj) => {
      const {id, file, description, contentType} = mediaObj
      return {
        contentType: contentType,
        description: description,
        id: id,
        file: file,
      }
    });
    const mergedAttachments = [...readyToBeSaved, ...trespassDocumentPDFs];
    // UpdateReport will pass attachmentsData to CreateMedia on PUT success
    setAttachmentsData(mergedAttachments);
    // console.log('@Edit - the PUT data: ', JSON.stringify(data, null, 2));
    setPutData(data);
    setSelectedCustomers([]);
    setSelectedWitnesses([]);
    } catch (error) { 
      console.error('error in edit submit - error: ', error)
    };
  };

  const cleanupCustomerDeclarations = () => {
    const allowSet = new Set(customersToUpdateDeclaration);
    const selectedCustomerIds = new Set(selectedCustomers.map(c => c.id));
    // const wiped = [];

    const updated = allCustomers.map((cust) => {
      const hasDoS = _hasCurrentDeclaration(cust);
      if (!hasDoS) return cust;

      // const originallyHad = originalDeclarationCustomerIds.has(cust.id);
      const newlyAdded = _isNewlyAddedDeclaration(cust); // at CURRENT time
      const edited = editedCustomerIDs.has(cust.id);

      const keep =
        allowSet.has(cust.id) || // explicitly opted-in
        selectedCustomerIds.has(cust.id) || // new customer this session
        newlyAdded || // newly added DoS
        (!topLevelAffectsDeclaration && !edited); // only document-affecting globals

      if (keep) return cust;

      const clone = { ...cust, trespass: { ...cust.trespass } };
      delete clone.trespass.declarationOfService;

      return clone;
    });
    return updated;
  };

  const handleSaveAndCloseClick = () => {
    // staffSuppressed only path
    if (staffSuppressedIsDirty && !formIsDirty) {
      handleSubmit();
      return;
    };
    if (isNoCustomer) {
      handleSubmit();
      return;
    };
    if (missingIds.length > 0) {
      setIsModalAttentionDecOfService(true);
      return;
    };
    // good to go, no exceptions/warns happy path
    handleSubmit();
  };

  const handleSubmit = () => {
    setIsUpdatingReport(true);
    const readyCustomers = formData.staffSuppressed 
      ? allCustomers
      : cleanupCustomerDeclarations();
    finalizeSubmission(readyCustomers);
  };

  const dateIsNotInFuture = (dateString) => {
    const todayString = getTodayDate();
    const todayDate = parseMMDDYYYY(todayString);
    todayDate.setHours(0,0,0,0);
    const formDataDate = parseMMDDYYYY(dateString);
    if (formDataDate <= todayDate) {
      return true
    } else if (formDataDate > todayDate){
      return false
    };
  };

  const isFormDataValid = () => {
    const isCustomersValid = 
    (allCustomers.length > 0 && !formData.customerNa) || formData.customerNa;
    const isIncidentDetailsValid =
      formData.incidentLocation !== '' &&
      isValidDateFormat(formData.dateTimeOfIncident) &&
      dateIsNotInFuture(formData.dateTimeOfIncident) &&
      stripHTML(formData.detailedDescriptionOfIncident) !== '' &&
      isValidTimeInput(formData.timeOfIncident);
    const isIncidentTypeValid = formData.incidentTypes.length > 0;
    const isWitnessValid = allWitnesses && allWitnesses.length > 0; 
    return (
      isCustomersValid &&
      isIncidentDetailsValid &&
      isIncidentTypeValid &&
      isWitnessValid
    );
  };

  const handleGetCreatedByName = (createdByNameObj) => {
    if (createdByNameObj) {
      // console.log("@handleGetCreatedByName - createdByNameObj: ", JSON.stringify(createdByNameObj, null, 2))
      setCreatedByForRender({
        id: createdByNameObj.id,
        barcode: createdByNameObj.barcode,
        firstName: createdByNameObj.firstName,
        lastName: createdByNameObj.lastName
      })
    } else {
      setCreatedByForRender({
        id: '',
        barcode: '',
        firstName: '',
        lastName: ''
      })
    }
  };

  const handleGetUpdatedByName = (updatedByNameObj) => {
    if (updatedByNameObj) {
      setUpdatedByForRender({
        id: updatedByNameObj.id,
        barcode: updatedByNameObj.barcode,
        firstName: updatedByNameObj.firstName,
        lastName: updatedByNameObj.lastName
      })
    } else {
      setUpdatedByForRender({
        id: '',
        barcode: '',
        firstName: '',
        lastName: ''
      })
    }
  };

  // is passed into Modal
  const handleIncidentTypeToggle = (type) => {
    // console.log("@EDIT - handleIncidentTypeToggle, type: ", type)
   setFormData((prevFormData) => {
    const currentTypes = new Set(prevFormData.incidentTypes.map(t => t.id));
    if(currentTypes.has(type.id)) {
      return {
        ...prevFormData,
        incidentTypes: prevFormData.incidentTypes.filter(t => t.id !== type.id)
      };
    } else {
      return {
        ...prevFormData,
        incidentTypes: [...prevFormData.incidentTypes, type]
      }
    }
   })
  };

  const handleRemoveType = (typeId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      incidentTypes: prevFormData.incidentTypes.filter(type => type.id !== typeId)
    }));
  };

  const handleRemoveWitness = (witnessId) => {
    setFormData(prevFormData => ({
      ...prevFormData,
      incidentWitnesses: prevFormData.incidentWitnesses.filter(wit => wit.id !== witnessId)
    }));
    setSelectedWitnesses(prevSelectedWitnesses => (
      prevSelectedWitnesses.filter(wit => wit.id !== witnessId)
    ));
  };

  const handleMarkForRemoval = (mediaId) => {
    const updatedAttachments = formData.attachments.map((attachment) =>
      attachment.id === mediaId
        ? { ...attachment, toBeRemoved: true }
        : attachment
    );
    setFormData((prevState) => ({
      ...prevState,
      attachments: updatedAttachments,
    }));
  };

  const handleUndo = (mediaId) => {
    const updatedAttachments = formData.attachments.map((attachment) => {
      if(attachment.id === mediaId) {
        const { toBeRemoved, ...rest } = attachment;
        return { ...rest };
      }
      return attachment
    });
    setFormData((prevState) => ({
      ...prevState,
      attachments: updatedAttachments,
    }));
  };

  const handleAddSelfAsWitness = () => {    
    setFormData(prevFormData => {
      const isSelfAlreadyWitness = prevFormData.incidentWitnesses.some(
        wit => wit.id === self.id
      );
      if(isSelfAlreadyWitness) {
        return prevFormData
      };

      return {
        ...prevFormData,
        incidentWitnesses: [
          ...prevFormData.incidentWitnesses,
          self
        ]
      };
    });
  };

  const handleOpenAddCustomWitness = () => {
    openModalCustomWitness()
  };

  const handleShowTrespassFormModal = (trespassCustomerId) => {
    setTrespassCustomerID(trespassCustomerId);
    openModalTrespass();
  };

  const handleShowCustomerDetailsFormModal = (custId) => {
    setDetailsCustomerID(custId);
    openModalCustomerDetails();
  };

  const handleShowCustomWitModalAsEdit =  (witObj) => {
    setCustWitEditObj(witObj)
    openModalCustomWitness()
  };

  const handleShowCustomWitModalAsEditForUnsaved =  (witId) => {
    setCustWitEditID(witId)
    openModalCustomWitness()
  };
  
  // handle rendering inc type 'title' via associated key of 'id'
  // instead of the instance's inc type 'title'
  const preparedIncidentTypes = useMemo(() => {
    return formData.incidentTypes.map(incidentType => {
      const foundType = incidentTypesList.find(type => type.id === incidentType.id);
      const notFoundId = incidentType.id;
      return {
        id: incidentType.id,
        title: foundType ? foundType.title : 
          <FormattedMessage 
            id="incident-type-not-found-fallback" 
            values={{ id: notFoundId }}
          />
      };
    });
  }, [formData.incidentTypes, incidentTypesList]);

  const itemFormatterIncidentTypes = (item, index) => {
    if (!item) {
      // console.log("@itemFormatterIncidentTypes - no item ran ")
      return null; 
    };
    return (
      <li key={item.id ?? index}>
        {item.title}
        <button
          style={{ paddingLeft: '8px' }}
          onClick={() => handleRemoveType(item.id)}
          type="button"
          aria-label={`Remove ${item.title}`}
        >
          <Icon icon="trash" size="medium" />
        </button>
      </li>
    );
  };

  const handleCustomerNa = (event) => {
    setFormData((prev) => ({
      ...prev,
      customerNa: event.target.checked,
    }));
    setIsNoCustomer(prev => !prev );
  };

  const handleStaffSuppressed = (event) => {
    setFormData((prev) => ({
      ...prev,
      staffSuppressed: event.target.checked,
    }));
  };

  const extractSnippet = (description) => {
    // regex remove HTML tags
    const text = description.replace(/<[^>]*>/g, '');
    return text.length > 60 ? text.slice(0, 57) + '...' : text;
  };

  // useEffect(() => {
  //   console.log('[EditPane] allCustomers -> ', JSON.stringify(allCustomers, null, 2))
  // }, [allCustomers]);

  const itemFormatterCustomers = (cust) => {
    const notAvailable = intl.formatMessage({ id: "unknown-name-placeholder" });

    const firstName = cust.registered === false ? 
      cust.firstName || notAvailable : cust.associatedFirstName;

    const lastName = cust.registered === false ?
      cust.lastName || notAvailable : cust.associatedLastName;

    const snippetOfDescription = cust.description ? extractSnippet(cust.description) : '';

    const trespassServed = cust.trespass && cust.trespass.declarationOfService;

    const name = `${lastName}, ${firstName}`;

    return (
      <li key={cust.id} style={{ marginTop: '12px' }}>
        {cust.firstName === '' && cust.lastName === '' ? (
          snippetOfDescription
        ) : cust.registered ? (
          <a
            href={`/users/preview/${cust.id}`}
            target="_blank"
            aria-label="Link to customer in users application"
            style={{
              textDecoration: 'none',
              color: 'rgb(0,0,238)',
              fontWeight: 'bold',
            }}
            rel="noreferrer"
          >
          {/* render associated key name if instance customer, else if newly added customer show name  */}
          {cust.associatedFirstName ? name : `${cust.lastName}, ${cust.firstName}`}
          </a>
        ) : (
          name // unregistered customer show instance name 
        )}

        {/* customer has been served their trespass */}
        {trespassServed ? (
          <span style={{ marginLeft: '10px', color: 'green' }}>
            <Icon icon="check-circle" />
          </span>
        ) : null}

        <button
          style={{ paddingLeft: '8px' }}
          onClick={() => handleRemoveCustomer(cust.id)}
          type="button"
          aria-label={`Remove ${name} as customer`}
        >
          <Icon icon="trash" size="medium" />
        </button>

        {cust.details || cust.description ? (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowCustomerDetailsFormModal(cust.id)}
            type="button"
          >
            <Icon icon="report" size="medium" /> 
            <FormattedMessage id="edit-details-button"/>
          </button>
        ) : (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowCustomerDetailsFormModal(cust.id)}
            type="button"
          >
            <Icon icon="plus-sign" size="medium" /> 
            <FormattedMessage id="add-details-button"/>
          </button>
        )}

        {cust.trespass ? (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowTrespassFormModal(cust.id)}
            type="button"
          >
            <Icon icon="report" size="medium" /> 
            <FormattedMessage id="edit-trespass-button"/>
          </button>
        ) : (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowTrespassFormModal(cust.id)}
            type="button"
          >
            <Icon icon="plus-sign" size="medium" /> 
            <FormattedMessage id="add-trespass-button"/>
          </button>
        )}
      </li>
    );
  };

  const witnessItemFormatter = (wit) => {
    const isCustomNotSaved = formData.incidentWitnesses.filter(incWit => incWit.id === wit.id).length === 0;
    return (
      <li key={wit.id}>
        {wit.isCustom === true ? (
          // custom witness 
          <>
            {wit.lastName}, {wit.firstName}
            {isCustomNotSaved ? (
              // show handler for edit unsaved custom witness
              <button
                style={{ paddingLeft: '15px' }}
                onClick={() => handleShowCustomWitModalAsEditForUnsaved(wit.id)}
                type="button"
              >
                <Icon icon="report" size="medium" /> Edit
              </button>) 
              : (
              <button
                style={{ paddingLeft: '15px' }}
                onClick={() => handleShowCustomWitModalAsEdit(wit)}
                type="button"
              >
                <Icon icon="report" size="medium" /> Edit
              </button>
            )}
          </>
        ) : wit.associatedFirstName ? (
          // Users witness
          <a
            href={`/users/preview/${wit.id}`}
            target="_blank"
            aria-label="Link to customer in users application"
            style={{
              textDecoration: 'none',
              color: 'rgb(0,0,238)',
              fontWeight: 'bold',
            }}
            rel="noreferrer"
          >
            {`${wit.associatedLastName}, ${wit.associatedFirstName}`}
          </a>
        ) : wit.id ? (
          // newly selected Users witness (not yet saved)
          <a
            href={`/users/preview/${wit.id}`}
            target="_blank"
            aria-label="Link to customer in users application"
            style={{
              textDecoration: 'none',
              color: 'rgb(0,0,238)',
              fontWeight: 'bold',
            }}
            rel="noreferrer"
          >
            {`${wit.lastName}, ${wit.firstName}`}
          </a>) : null}

        <button
          style={{ paddingLeft: '8px' }}
          onClick={() => handleRemoveWitness(wit.id)}
          type="button"
          aria-label={`Remove ${wit.lastName}, ${wit.firstName} as witness`}
        >
          <Icon icon="trash" size="medium" />
        </button>
      </li>
    );
  };

  const handleOpenModalAddMedia = () => {
    openModalMedia();
  };

  const customersListLabel = intl.formatMessage(
    { id: `customers-list-label` },
    { count: formData.customers.length }
  );

  const incidentTypesListLabel = intl.formatMessage(
    { id: `incident-types-list-label` },
    { count: preparedIncidentTypes.length } 
  );

  const witnessesListLabel = intl.formatMessage(
    { id: `witnesses-list-label` },
    { count: allWitnesses.length,
      bold: (chunks) => (
        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
      )
    }
  );

  const editorModules = {
   toolbar: [
      [{ 'header': [1, 2, false] }], 
      ['bold', 'italic', 'underline'], 
    ],
  };

  const canSave = isHydrated && isFormDataValid() && (formIsDirty ||staffSuppressedIsDirty);

  const footer = (
    <PaneFooter
      renderStart={
        <Button onClick={handleClickDismissCancel}>
          <FormattedMessage id="cancel-button" />
        </Button>
      }
      renderEnd={
        <Button
          buttonStyle="primary"
          onClick={handleSaveAndCloseClick} 
          disabled={!canSave} 
        >
          <FormattedMessage id="save-and-close-button" />
        </Button>
      }
    />
  );

  return (
    <>
      {id && <GetDetails id={id} />}
      {isLoadingDetails ? (
        <LoadingPane
          defaultWidth="fill"
          paneTitle={<FormattedMessage id="edit-pane.loading-pane-paneTitle" />}
        />
      ) : ( 
      <>
      {id && putData && (
        <UpdateReport
          id={id}
          data={putData}
          handleCloseEdit={handleCloseEdit}
        />
      )}

      {idForMediaCreate && formDataArrayForMediaCreate && (
        <CreateMedia
          id={idForMediaCreate}
          formDataArray={formDataArrayForMediaCreate}
          handleCloseEdit={handleCloseEdit}
          context="edit"
        />
      )}

      {isUpdatingReport ? (
        <LoadingPane
          defaultWidth="fill"
          paneTitle={<FormattedMessage id="edit-pane.loading-pane-submit-paneTitle" />}
        />
      ) : (
          <Pane
            paneTitle={<FormattedMessage id="edit-pane.paneTitle" />}
            defaultWidth="fill"
            renderHeader={(renderProps) => (
              <PaneHeader
                {...renderProps}
                dismissible
                onClose={handleClickDismissCancel}
              />
            )}
            footer={footer}
          >
          <GetTrespassTemplates />
          <GetTrespassReasons />

          {showDirtyFormModal && (
            <ModalDirtyFormWarn 
              handleKeepEditing={handleKeepEditing}
              handleDismissOnDirty={handleDismissOnDirty}
            />
          )}

          <GetSummary
            ids={idsArray}
            onResult={setLinkedToSummaries}
          />

          {showModalLinkIncident && (
            <ModalLinkIncident 
              toggleRowChecked={toggleRowChecked}
              ids={allLinkedTo}
              setIds={setAllLinkedTo}
              handleCloseModalLinkIncident={handleCloseModalLinkIncident}
            /> 
          )}

          {isModalAttentionDecOfService && (
            <ModalAttentionDecOfService 
              onNo={handleClickNo}
              onYes={handlClickYes}
              missingIds={missingIds}
              allCustomers={allCustomers}
            />
          )}

          {trespassCustomerID && (
            <ModalTrespass
              customerID={trespassCustomerID}
              setAllCustomers={setAllCustomers}
              allCustomers={allCustomers}
              onStagedTrespassUpdate={handleStagedTrespassUpdate}
              updateDeclarationArray={customersToUpdateDeclaration}
              onUpdateDeclaration={handleUpdateDeclaration}
              customersWithoutDeclaration={customersWithoutDeclaration}
              isNewlySelected={newlyAddedCustomerIds.has(trespassCustomerID)}
            />
          )}

          {detailsCustomerID && (
            <ModalCustomerDetails
              customerID={detailsCustomerID}
              setAllCustomers={setAllCustomers}
              allCustomers={allCustomers}
            />
          )}
        {custWitEditObj && Object.keys(custWitEditObj).length > 0 ? (
            // Edit saved custom witness 
            <ModalCustomWitness 
              context='editSavedCustomWitness'
              formData={formData}
              setFormData={setFormData}
              setCustWitEditObj={setCustWitEditObj}
              custWitEditObj={custWitEditObj}
            />
          ) : custWitEditID ? (
            // Edit un-saved custom witness
            <ModalCustomWitness 
              // utilizes selectedWitnesses React context at Modal
              custWitEditID={custWitEditID}
            />
            ) : (
            // Add a new custom witness
            <ModalCustomWitness 
              // utilizes selectedWitnesses React context at Modal
              context='addCustomWitAtEdit'
            />
          )}

          {singleIncident.customers?.map((cust) => {
            if (cust.registered === false) {
              return null
            }
            return (
              <GetName 
                key={cust.id}
                uuid={cust.id} 
                handleGetCustName={handleGetCustName} 
                handleMissingUsers={handleMissingUsers}
                context='customer'
              />
            )
          })}

          {formData.incidentWitnesses?.map((wit) => (
            <GetName 
              isCustomWitness={wit.isCustom === true ? wit : null}
              key={wit.id}
              uuid={wit.id} 
              handleGetWitnessName={handleGetWitnessName} 
              handleMissingUsers={handleMissingUsers}
              context='witness'/>
            ))
          }

          {updatedById && updatedById !== '' && (
            <GetName 
              uuid={updatedById}
              handleGetUpdatedByName={handleGetUpdatedByName}
              handleMissingUsers={handleMissingUsers}
              context="updatedBy"
            />
          )}
  
          {createdById && createdById !== '' && (
            <GetNameCreatedBy 
              uuid={createdById}
              handleGetCreatedByName={handleGetCreatedByName}
              handleMissingUsers={handleMissingUsers}
            />
          )}

          <GetLocationsInService />
          <GetIncidentTypesDetails context='incidents'/>
          <ModalAddMedia 
            context='edit'
            handleAddMedia={handleAddMedia}
            />
          <ModalDescribeCustomer />
          <ModalSelectKnownCustomer 
            context='edit'
            setRemovedCustomerIds={setRemovedCustomerIds}
            removedCustomerIds={removedCustomerIds}
            setFormData={setFormData} 
            formData={formData}
            />
          <ModalSelectWitness 
            context='edit'
            setFormData={setFormData} 
            formData={formData}
            setRemovedWitnessIds={setRemovedWitnessIds}
            removedWitnessIds={removedWitnessIds}
            />
          <ModalSelectIncidentTypes
            handleIncidentTypeToggle={handleIncidentTypeToggle}
            formDataIncidentTypes={formData.incidentTypes}
          />

          <GetSelf />

          {/* if 404 for any /Users request get associated key for name, render MessageBanner with message and those unfound uuid(s) */}
          <Row>
            <Col xs={12}>
              <div>
                <MessageBanner 
                  dismissible
                  type="error"
                  show={missingUsers.length > 0}
                  >
            {<FormattedMessage 
              id="message-banner.error-missing-users-404" 
              values={{ ids: missingUsers.join(', ') }}
              />}
                </MessageBanner>
              </div>
            </Col>
          </Row>

          <AccordionSet>
            <ExpandAllButton />
            <Accordion
              closedByDefault={true}
              label={<FormattedMessage 
                id="edit-pane.accordion-administrative-data-label"/>}>
            <MetaSection
              headingLevel={4}
              useAccordion
              showUserLink
              createdDate={formData?.metadata?.createdDate || null}
              lastUpdatedDate={formData?.metadata?.updatedDate || null}
              createdBy={{
                id: createdByForRender.id,
                personal: {
                  firstName: createdByForRender.firstName,
                  lastName: createdByForRender.lastName
                }
              }} 
              lastUpdatedBy={{
                id: updatedByForRender.id,
                personal: {
                  firstName: updatedByForRender.firstName,
                  lastName: updatedByForRender.lastName,
                }
              }}
            />
            <Row>
              <Col xs={6}>
                <Checkbox 
                  label={<FormattedMessage id="edit-pane.checkbox-staff-suppress"/>}
                  checked={formData.staffSuppressed}
                  name='staffSuppressed'
                  onChange={handleStaffSuppressed} 
                />
              </Col>
            </Row>
            </Accordion>
            <Accordion
              label={<FormattedMessage id="accordion-label-customers" />}
            >
          <Row>
            <Col xs={2} style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px'}}>
              <Checkbox
                label={<FormattedMessage id="customer-not-available"/>}
                checked={formData.customerNa}
                name='customerNa'
                onChange={handleCustomerNa} 
              />
            </Col>
          </Row>
           {!isNoCustomer && (
            <>
            <Row>
                <Col xs={3}>
                  <Button
                    style={{ marginTop: '25px' }}
                    onClick={openModalSelectKnownCust}
                  >
                    <FormattedMessage id="select-add-known-customer-button" />
                  </Button>
                </Col>
              </Row>
              <Row>
                <Col xs={3}>
                <Button
                  style={{ marginTop: '25px' }}
                  onClick={openModalUnknownCust}
                >
                  <FormattedMessage id="describe-add-unknown-customer-button" />
                </Button>
              </Col>
              </Row>
              <Row>
                <Col xs={6}>
                   <Label style={{ marginTop: '5px' }} size="medium" tag="h2" id='customer-list-label'>
                    <b>{customersListLabel}</b>
                  </Label>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <List
                    aria-labelledby='customer-list-label'
                    listStyle="bullets"
                    label="Customers"
                    items={allCustomers} 
                    isEmptyMessage={
                      <FormattedMessage
                        id="customers-list-is-empty-message"
                        values={{
                          bold: (chunks) => (
                            <strong style={{ color: '#A12A2A' }}>
                              {chunks}
                            </strong>
                          )
                        }}
                      />
                    }
                    itemFormatter={itemFormatterCustomers}
                  />
                </Col>
              </Row>
            </>

           )}
          </Accordion>

            <Accordion
              label={<FormattedMessage id="accordion-label-incident" />}
            >
              <Row>
                <Col xs={3}>
                  <Select
                    required
                    label={
                      <FormattedMessage id="edit-pane.incident-location-select-label" />
                    }
                    name="incidentLocation"
                    value={formData.incidentLocation}
                    dataOptions={locationDataOptions}
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={3}>
                  <Select
                    label={
                      <FormattedMessage id="edit-pane.sub-location-select-label" />
                    }
                    name="subLocation"
                    value={formData.subLocation}
                    dataOptions={subLocationsDataOptions}
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={3}>
                  <Datepicker
                    required
                    name="dateTimeOfIncident"
                    value={formData.dateTimeOfIncident}
                    label={
                      <FormattedMessage id="edit-pane.date-of-incident-date-picker-label" />
                    }
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={2}>
                  <Timepicker
                    required
                    name="timeOfIncident"
                    value={formData.timeOfIncident}
                    label={
                      <FormattedMessage id="edit-pane.time-of-incident-date-picker-label" />
                    }
                    onChange={handleChange}
                  />
                </Col>

                <Col xs={2} style={{ marginTop: '25px' }}>
                <Checkbox 
                  label='Approximate time'
                  name='isApproximateTime'
                  checked={formData.isApproximateTime}
                  onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={4}>
                  <Button
                    onClick={openModalSelectTypes}
                    style={{ marginTop: '15px' }}
                  >
                    <FormattedMessage id="edit-pane.select-add-incident-type-button" />
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col xs={8} style={{ paddingLeft: '20px' }}>
                  <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                    <b>{incidentTypesListLabel}</b>
                  </Label>
                  <List
                    listStyle="bullets"
                    label={incidentTypesListLabel}
                    items={preparedIncidentTypes} 
                    isEmptyMessage={
                      <FormattedMessage
                        id="incident-types-list-is-empty-message"
                        values={{
                          bold: (chunks) => (
                            <strong style={{ color: '#A12A2A' }}>
                              {chunks}
                            </strong>
                          ),
                        }}
                      />
                    }
                    itemFormatter={itemFormatterIncidentTypes}
                  />
                </Col>
              </Row>

              <Row style={{ marginTop: '25px' }}>
                <Col xs={6}>
                  <Editor
                    required
                    label={
                      <FormattedMessage id="edit-pane.incident-description" />
                    }
                    defaultValue={formData.detailedDescriptionOfIncident}
                    onChange={handleDescriptionChange}
                    onBlur={handleEditorBlur}
                    onKeyDown={handleEditorKeyDown}
                    modules={editorModules}
                  />
                </Col>
              </Row>

              <Row>
                <Col xs={2} style={{ paddingTop: '25px' }}>
                  <Button onClick={openModalSelectWitness}>
                    <FormattedMessage id="select-add-witness-button" />
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col xs={2} style={{ paddingTop: '25px' }}>
                  <Button onClick={handleAddSelfAsWitness}>
                    <FormattedMessage id="add-self-witness-button" />
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col xs={2} style={{ paddingTop: '25px' }}>
                  <Button 
                    onClick={handleOpenAddCustomWitness}
                    >
                    <FormattedMessage id="add-custom-witness-button" />
                  </Button>
                </Col>
              </Row>

              <Row>
                <Col xs={2} style={{ paddingTop: '25px' }}>
                    <Button onClick={handleOpenModalLinkIncident}>
                      <FormattedMessage id="link-to-button" />
                    </Button>
                </Col>
              </Row>
              
              <Row>
                <Col xs={8}>
                  <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                    <FormattedMessage
                      id="witnesses-list-label"
                      defaultMessage="{count, plural, one {{bold}Witness} other {{bold}Witnesses}}"
                      values={{
                        count: allWitnesses.length,
                        bold: (chunks) => <strong>{chunks}</strong>,
                      }}
                    />
                  </Label>
                  <List
                    listStyle="bullets"
                    label={witnessesListLabel}
                    items={allWitnesses}
                    isEmptyMessage={
                      <FormattedMessage
                        id="witnesses-list-is-empty-message"
                        values={{
                          bold: (chunks) => (
                            <strong style={{ color: '#A12A2A' }}>
                            {chunks}
                            </strong>
                          ),
                        }}
                      />
                    }
                    itemFormatter={witnessItemFormatter}
                  />
                </Col>
              </Row>

              {linkedToSummaries.length > 0 ? (
                <Row style={{ marginTop: '25px' }}>
                  <Col xs={2}>
                    <KeyValue 
                      label={<FormattedMessage id="linked-incidents-label"/>}
                      value={
                        <div style={{ display: 'grid', rowGap: '10px' }}>
                          {linkedToSummaries.map((ltS) => (
                            <LinkedIncident 
                              key={ltS.id}
                              summaryObj={ltS}
                              onDelete={handleTrashLinkedIncident}
                              renderContext='create-edit'
                            />
                          ))}
                        </div>
                      }
                    />
                  </Col>
                </Row>
              ) : null}
            </Accordion>

            <Accordion label={<FormattedMessage id="accordion-label-media" />}>
             <div>
                {mediaArray.map((attachment) => (
                  <GetMedia 
                    context='thumbnail'
                    contentType={attachment.contentType}
                    key={attachment.id}
                    id={id}
                    imageId={attachment.id}
                    mediaHandler={(mediaUrl) => handleMediaUrl(mediaUrl, attachment.id)}
                  />
                ))}
              </div>       

              <Row style={{ margin: '25px' }}>
                <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                {mediaArray.slice(0, 5).map((attachment) => (
                  <Col xs={2} key={attachment.id} style={{ minHeight: '200px' }}>
                  {loadingStatus[attachment.id] && isImageArrayLoading ? <ThumbnailSkeleton />
                  : attachment.toBeRemoved ? (
                    <ThumbnailMarkRemoval 
                      undoId={attachment.id} 
                      handleUndo={handleUndo}
                      />
                  ) : <Thumbnail
                      key={attachment.id}
                      handleMarkForRemoval={handleMarkForRemoval}
                      mediaId={attachment.id}
                      src={mediaSrc[attachment.id]}
                      alt={attachment.description}
                      imageDescription={attachment.description}
                      contentType={attachment.contentType}
                      style={thumbnailStyle}
                      isMarkedForRemoval={attachment.toBeRemoved}
                    />
                  }
                  </Col>
                ))}
              </Row>
              <Row style={{ margin: '25px' }}>
                <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                {mediaArray.slice(5, 10).map((attachment) => (
                  <Col xs={2} key={attachment.id}>
                  {loadingStatus[attachment.id] && isImageArrayLoading ? <ThumbnailSkeleton />
                  : attachment.toBeRemoved ? (
                    <ThumbnailMarkRemoval 
                      undoId={attachment.id} 
                      handleUndo={handleUndo}
                      />
                  ) : <Thumbnail
                      key={attachment.id}
                      handleMarkForRemoval={handleMarkForRemoval}
                      mediaId={attachment.id}
                      src={mediaSrc[attachment.id]}
                      alt={attachment.description}
                      imageDescription={attachment.description}
                      contentType={attachment.contentType}
                      style={thumbnailStyle}
                    />
                  }
                  </Col>
                ))}
              </Row>

              <Row style={{ margin: '25px' }}>
                 <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                  {unsavedMediaArray.map((attachment) => (
                    <Col xs={2} key={attachment.id}>
                      <ThumbnailTempPreSave 
                        contentType={attachment.contentType}
                        handleRemoveUnsavedMedia={handleRemoveUnsavedMedia}
                        key={attachment.id}
                        mediaId={attachment.id}
                        src={attachment.filePreviewUrl}
                        alt={attachment.description}
                        imageDescription={attachment.description}
                        style={thumbnailStyle}
                      />
                    </Col>
                  ))}
              </Row>

              <Row style={{ marginTop: '25px' }}>
                <Col xs={2}>
                  <Button onClick={handleOpenModalAddMedia}>
                    <FormattedMessage id="add-media-button" />
                  </Button>
                </Col>
              </Row>
            </Accordion>
            <Accordion label={<FormattedMessage id="accordion-label-documents"/>}>
             <div>
                {documents.map((doc) => (
                  <GetMedia 
                    context='document'
                    key={doc.id}
                    id={id}
                    imageId={doc.id}
                    mediaHandler={(mediaUrl) => handleMediaUrl(mediaUrl, doc.id)}
                  />
                ))}
              </div>
              
              {/* This sorts and maps document buttons. The most recent documents are placed at the visual top of list with a clock icon to identify the most current trespass document(s). */}
             <div>
              <Col xs={1} style={{ visibility: 'hidden' }}></Col>
                {sortedDocuments.map((doc) => (
                    <Row xs={2} style={{ marginLeft: '15px' }} key={doc.id}>
                      {doc.toBeRemoved ? (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '10px',
                          }}
                        >
                          <Button
                            onClick={() => handleUndo(doc.id)}
                            style={{ marginTop: '25px' }}
                            buttonStyle='default'
                          >
                            <FormattedMessage id='undo-button' />
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginLeft: '10px',
                          }}
                        >
                          <Button
                            allowAnchorClick={true}
                            href={mediaSrc[doc.id]}
                            target='_blank'
                            style={{ marginTop: '15px' }}
                          >
                            {doc.description}
                          </Button>

                          {/* if most current document, render clock icon */}
                          {mostCurrentTrespassDocIds.includes(doc.id) && (
                            <span style={{ marginLeft: '8px' }}>
                              <Icon icon='clock' size='small' />
                            </span>
                          )}

                          {/* 
                            Track application may or may not utilize delete trespass documents functionality. 
                            Possibly will be a configuration or specific perm in future release. 
                            Commenting out for now, rest of logic is present.
                          */}
                          {/* 
                          <div style={{ marginLeft: '5px' }}>
                            <button onClick={() => handleMarkForRemoval(doc.id)}>
                              <Icon icon='trash'></Icon>
                            </button>
                          </div> 
                          */}
                        </div>
                      )}
                    </Row>
                  ))}
              </div>
            </Accordion>
          </AccordionSet>
        </Pane>)}
      </>
    )})
    </>
  );
};
export default EditPane;