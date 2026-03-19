import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { decode } from 'html-entities';
import {
  Accordion,
  AccordionSet,
  Button,
  Checkbox,
  Col,
  Datepicker,
  Editor,
  ExpandAllButton,
  List,
  Icon,
  KeyValue,
  Label,
  LoadingPane,
  Pane,
  PaneHeader,
  PaneFooter,
  Row,
  Select,
  Timepicker
} from '@folio/stripes/components';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetIncidentTypesDetails from '../../settings/GetIncidentTypesDetails';
import ModalSelectIncidentTypes from './ModalSelectIncidentTypes';
import ModalSelectKnownCustomer from './ModalSelectKnownCustomer';
import ModalSelectWitness from './ModalSelectWitness';
import ModalDescribeCustomer from './ModalDescribeCustomer';
import ModalTrespass from './ModalTrespass';
import ModalCustomerDetails from './ModalCustomerDetails';
import ModalAddMedia from './ModalAddMedia';
import CreateMedia from './CreateMedia';
import GetLocations from './GetLocations';
import GetSelf from './GetSelf';
import CreateReport from './CreateReport';
import makeId from '../../settings/helpers/makeId';
import ThumbnailTempPreSave from './ThumbnailTempPreSave';
import ModalCustomWitness from './ModalCustomWitness';
import GetTrespassTemplates from '../../settings/GetTrespassTemplates';
import GetTrespassReasons from '../../settings/GetTrespassReasons';
import stripHTML from './helpers/stripHTML';
import getTodayDate from './helpers/getTodayDate';
import isValidDateFormat from './helpers/isValidDateFormat';
import isValidTimeInput from './helpers/isValidTimeInput';
import { isSameHtml } from './helpers/isSameHtml.js';
// format to local date at midnight and one second in UTC ISO:
import formatDateToUTCISO from './helpers/formatDateToUTCISO'; 
// format for dateTimeOfIncident:
import formatDateAndTimeToUTCISO from './helpers/formatDateAndTimeToUTCISO';
import getCurrentTime from './helpers/getCurrentTime';
import hasFormChangedAtCreate from './helpers/hasFormChangedAtCreate.js';
import ModalDirtyFormWarn from './ModalDirtyFormWarn.js';
import ModalLinkIncident from './ModalLinkIncident.js';
import GetSummary from './GetSummary.js';
import LinkedIncident from './LinkedIncident.js';

import { useIncidents } from '../../contexts/IncidentContext';
import {
  generateTrespassDocuments,
  generatePDFAttachments
} from './helpers/trespassDocUtils.js';

const CreatePane = () => {
  const history = useHistory();
  const intl = useIntl();
  const {
    openModalSelectTypes,
    closeCreatePane, 
    openModalUnknownCust,
    openModalSelectKnownCust,
    openModalSelectWitness,
    openModalMedia,
    idForMediaCreate,
    setIdForMediaCreate,
    formDataArrayForMediaCreate,
    setFormDataArrayForMediaCreate,
    selectedCustomers,
    setSelectedCustomers,
    selectedWitnesses,
    setSelectedWitnesses,
    setAttachmentsData,
    self,
    openModalTrespass,
    openModalCustomerDetails,
    incidentTypesList,
    openModalCustomWitness, 
    isCreatingReport, 
    setIsCreatingReport,
    locationsInService,
    trespassTemplates,
    triggerDocumentError,
    trespassReasons
  } = useIncidents();

  const [linkedToSummaries, setLinkedToSummaries] = useState([]);// built from 'selectedIds' 
  const [selectedIds, setSelectedIds] = useState(() => new Set());// linkedTo ids
  const [showModalLinkIncident, setShowModalLinkIncident] = useState(false);
  const [trespassCustomerID, setTrespassCustomerID] = useState(null);
  const [detailsCustomerID, setDetailsCustomerID] = useState(null);
  const [postData, setPostData] = useState({});
  const [subLocationsDataOptions, setSubLocationsDataOptions] = useState([]);
  const [custWitEditID, setCustWitEditID] = useState('');
  const [isNoCustomer, setIsNoCustomer] = useState(false);
  const [trespassTemplate, setTrespassTemplate] = useState('');
  const [showDirtyFormModal, setShowDirtyFormModal] = useState(false);
  const editorWasTouchedRef = useRef(false);
  const initialFormData = useRef({
    customerNa: false,
    customers: [],
    incidentLocation: '',
    subLocation: '',
    dateOfIncident: getTodayDate(),
    timeOfIncident: getCurrentTime(),
    isApproximateTime: false,
    detailedDescriptionOfIncident: '',
    incidentWitnesses: [],
    incidentTypes: [],
    attachments: [],
    linkedTo: [],
    id: 'abcd1234-abcd-4bcd-8def-0123456789ab',
  }).current;
  const [formData, setFormData] = useState(initialFormData);

  const hasFormChanged = () => hasFormChangedAtCreate({
    formData,
    initialFormData,
    selectedCustomers,
    selectedWitnesses,
    selectedIds,
    editorWasTouched: editorWasTouchedRef.current,
  });

  const idsArray = useMemo(
    () => Array.from(selectedIds).sort(),
    [selectedIds]
  );

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

  // useEffect(() => {
  //   console.log("formData: ", JSON.stringify(formData, null, 2))
  // }, [formData]);

  const toggleRowChecked = useCallback((id) => {
    setSelectedIds(prev => {
      const nextSet = new Set(prev);
      nextSet.has(id) ? nextSet.delete(id) : nextSet.add(id);
      // console.log('current checked --> ', JSON.stringify([...nextSet]));
      return nextSet; 
    })
  }, []);

  const thumbnailStyle = { width: '100px', height: 'auto', objectFit: 'cover'};

  // is leveraged by UI and Handlebars 'formatLocation' helper
  const locationDataOptions = useMemo(() => {
    const defaultValueLabel = [{ 
      value: '', 
      label: <FormattedMessage 
        id="create-pane.locationDataOptions-label-select-location"/> 
    }]; 
    const formattedLocations = locationsInService 
      ? locationsInService.map((loc) => ({
          value: loc.id, 
          label: loc.location,
          subLocations: loc.subLocations ? loc.subLocations : []
        }))
      : [{ 
        value: '',  
        label: <FormattedMessage 
          id="create-pane.locationDataOptions-label-no-loaded"/> 
      }]; 
    // console.log("formattedLocations: ", JSON.stringify(formattedLocations, null, 2))
    return [
      ...defaultValueLabel,
      ...formattedLocations,
    ];
  }, [locationsInService]);

  const runSubLocationsSelect = (value) => {
    let subLocs;
    let options;
    const noSubLocationOption = [
      { 
        value: 'No sub-location', 
        label: <FormattedMessage 
          id="create-pane.subLocations-label-default-no-sub-location"/>
      }, 
    ];
    const noValueLabel = [
      { 
        value: 'No sub-location', 
        label: <FormattedMessage 
          id="create-pane.subLocations-label-no-sub-location-available"
        />
      }, 
    ];
    const currentValue = locationDataOptions.find((loc) => loc.value === value);

    if (currentValue && currentValue.subLocations && currentValue.subLocations.length > 0) {
      subLocs = currentValue.subLocations.map((sub) => {
        return { value: sub.name, label: `${sub.name} - ${sub.description}` };
      });
      options = [...noSubLocationOption, ...subLocs];
    } else {
      options = [...noValueLabel];
    }
    setSubLocationsDataOptions(options);
  };

  const handleChange = (eventOrValue) => {
    let name;
    let value;
    if (eventOrValue && eventOrValue.target) {
      ({ name, value } = eventOrValue.target);
    } else {
      // handles if no 'target' property in custom component, such as
      // ( has array of selected options, not event object)
      name = 'incidentWitnesses';
      value = eventOrValue;
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
      runSubLocationsSelect(value);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    } if (name === 'isApproximateTime') {
      setFormData((prev) => ({
        ...prev,
        [name]: eventOrValue.target.checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  /*
    Keep current HTML in a ref so keystrokes update w/out setting state.
    This prevents react-quill's cleanup <-> setState feedback loop that otherwise
    causes maximum update depth exceeded error when links are present in editor.
  */
  // local unsanitized buffer - doesn't trigger React re-renders
  const draftRef = useRef(formData.detailedDescriptionOfIncident);

  // fire on every key-press but only mutautes the ref
  const handleEditorChange = (content) => {
    draftRef.current = content; 
    if (!editorWasTouchedRef.current && content && content.trim() !== '') {
      editorWasTouchedRef.current = true;
    }
  };

  // commits once, with sanitized HTML 
  const handleEditorBlur = () => {
    const sanitizedContent = DOMPurify.sanitize(draftRef.current);
    setFormData(prev => 
      isSameHtml(prev.detailedDescriptionOfIncident, sanitizedContent) 
      ? prev 
      : { ...prev, detailedDescriptionOfIncident: sanitizedContent}
    );
  };

  const handleCustomerNa = (event) => {
    setFormData((prev) => ({
      ...prev,
      customerNa: event.target.checked,
    }));
    setIsNoCustomer(prev => !prev );
  };

  const handleDismiss = () => {
    if (hasFormChanged()) {
      setShowDirtyFormModal(true);
    } else {
      handleCloseOnCancelDismiss();
    }
  };

  const handleKeepEditing = () => {
    setShowDirtyFormModal(false);
  };

  const handleDismissOnDirty = () => {
    handleCloseOnCancelDismiss();
  };

  const handleCloseOnCancelDismiss = () => {
    setIdForMediaCreate(null);
    setFormDataArrayForMediaCreate(null);
    setAttachmentsData([]);
    setSelectedCustomers([]);
    setSelectedWitnesses([]);
    closeCreatePane();
    history.push('/incidents');
  };

  const handleCloseNewOnSuccess = (id) => {
    closeCreatePane();
    history.push(`/incidents/${id}`);
  };

  const handleSubmit = async () => {
    try {
      const formattedCustomers = selectedCustomers.map((cust) => {
        const customer = {
          id: cust.id,
          barcode: cust.barcode,
          firstName: cust.firstName,
          lastName: cust.lastName,
          description: cust.description ? cust.description : '',
          registered: cust.registered,
        };
        if (cust.trespass) {
          customer.trespass = cust.trespass;
        }
        if (cust.details) {
          customer.details = cust.details;
        }
        return customer;
      });

      const formattedWitnesses = selectedWitnesses.map((cust) => {
        return {
          id: cust.id,
          firstName: cust.firstName,
          lastName: cust.lastName,
          ...(cust.barcode && { barcode: cust.barcode }),
          ...(cust.role && { role: cust.role }),
          ...(cust.phone && { phone: cust.phone }),
          ...(cust.email && { email: cust.email }),
          ...(cust.isCustom && { isCustom: cust.isCustom })
        };
      });

      const customersList =
        formattedCustomers.length > 0 ? formattedCustomers : [];

      const allCustomersSet = customersList.map((cust) => {
        let updatedCustomer = { ...cust };
        if (cust.trespass) {
          const trespassDescriptionRaw = cust.trespass.description || '';
          const sanitizedCustomDesc = DOMPurify.sanitize(trespassDescriptionRaw);
          const rawText = decode(sanitizedCustomDesc)
            .replace(/<\/?[^>]+>/g, '')
            .trim();

          const useCustomDescription = rawText !== '';
          if (!useCustomDescription && cust.trespass.description) {
            // remove unused key
            delete cust.trespass.description
          }
          updatedCustomer = {
            ...updatedCustomer,
            trespass: {
              ...cust.trespass,
              ...(cust.trespass.dateOfBirth
                ? { dateOfBirth: formatDateToUTCISO(cust.trespass.dateOfBirth) }
                : {}),
              dateOfOccurrence: formatDateToUTCISO(formData.dateOfIncident),
              ...(cust.trespass.endDateOfTrespass
                ? {
                  endDateOfTrespass: formatDateToUTCISO(cust.trespass.endDateOfTrespass, 1),
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
              /* 
                Use custom 'trespass.description' if it has meaningful text,
                otherwise default to top level key 'detailedDescriptionOfIncident' for populating 'descriptionOfOccurrence'. 
              */
              descriptionOfOccurrence: useCustomDescription
                  ? sanitizedCustomDesc
                  : formData.detailedDescriptionOfIncident,
              ...(useCustomDescription && { description: sanitizedCustomDesc }),
              witnessedBy: formattedWitnesses,
            },
          };
        }


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
        // console.log("updatedCustomer: ", JSON.stringify(updatedCustomer, null, 2))
        return updatedCustomer;
      });

      const readyToBeSaved = formData.attachments.map((mediaObj) => {
        const {id, file, description, contentType} = mediaObj
        return {
          contentType: contentType,
          description: description,
          id: id,
          file: file,
        }
      });

      const linkedToArray = Array.from(selectedIds);

      const data = {
        ...formData,
        linkedTo: linkedToArray,
        attachments: readyToBeSaved,
        customers: allCustomersSet,
        dateTimeOfIncident: formatDateAndTimeToUTCISO(formData.dateOfIncident, formData.timeOfIncident),
        incidentWitnesses: formattedWitnesses,
        createdBy: {
          barcode: self.barcode ? self.barcode : '',
          id: self.id,
          lastName: self.lastName,
          firstName: self.firstName,
        },
      };
      
      const helperDeps = { locationDataOptions, trespassReasons, self, triggerDocumentError};

      // generate trespass documents
      let readyTrespassDocuments = [];
      try {
        readyTrespassDocuments = generateTrespassDocuments(
          allCustomersSet, 
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

      let trespassDocumentPDFs = [];
      try {
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

      const finalMergedAttachments = [...readyToBeSaved, ...trespassDocumentPDFs];

      delete data.dateOfIncident;
      delete data.timeOfIncident;

      const finalData = {
        ...data,
        // CreateReport will unpack attachments and pass to CreateMedia on POST success
        attachments: finalMergedAttachments 
      };

      if (formData.incidentTypes && formData.incidentTypes.length > 0) {
        data.incidentTypes = formData.incidentTypes;
      }
      // console.log("@CREATE - finalData at save: ", JSON.stringify(finalData, null, 2))
      setIsCreatingReport(true);
      setPostData(finalData);
      setSelectedCustomers([]);
      setSelectedWitnesses([]);
    } catch (error) {
      console.error('error in submit. error: ', error)
    };
  };

  const parseMMDDYYYY = (dateString) => {
    const [month, day, year] = dateString.split('/').map((val) => parseInt(val, 10));
    return new Date(year, month - 1, day); 
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
    const isCustomersPresent =
      selectedCustomers && selectedCustomers.length > 0 || isNoCustomer === true;

    const isIncidentDetailsPresent = formData.incidentLocation && 
      formData.incidentLocation !== '' && 
      formData.dateOfIncident && isValidDateFormat(formData.dateOfIncident) && dateIsNotInFuture(formData.dateOfIncident) && 
      stripHTML(formData.detailedDescriptionOfIncident);

    const isIncidentTypeSelected =
      formData.incidentTypes && formData.incidentTypes.length > 0;

    const isWitnessSelected = selectedWitnesses && selectedWitnesses.length > 0;

    const isTimeValid = formData.timeOfIncident && 
      formData.timeOfIncident !== '' && isValidTimeInput(formData.timeOfIncident);

    return (
      isCustomersPresent &&
      isIncidentDetailsPresent &&
      isIncidentTypeSelected &&
      isWitnessSelected &&
      isTimeValid
    );
  };

  const handleIncidentTypeToggle = (type) => {
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

  // handle rendering inc type 'title' via associated key of 'id'
  // instead of the instance's inc type 'title'
  const preparedIncidentTypes = useMemo(() => {
    return formData.incidentTypes.map(incidentType => {
      const foundType = incidentTypesList.find(type => type.id === incidentType.id);
      return {
        id: incidentType.id,
        title: foundType ? foundType.title : "unknown"
      };
    });
  }, [formData.incidentTypes, incidentTypesList]);

  const handleRemoveType = (typeId) => {
    const updatedIncidentTypes = formData.incidentTypes.filter(
      (type) => type.id !== typeId
    );
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        incidentTypes: updatedIncidentTypes,
      };
    });
  };

  const handleRemoveSelectedCustomer = (id) => {
    const updatedSelectedCustomers = selectedCustomers.filter(
      (cust) => cust.id !== id
    );
    setSelectedCustomers(updatedSelectedCustomers);
  };

  const handleRemoveSelectedWitness = (id) => {
    const updatedSelectedWitnesses = selectedWitnesses.filter(
      (cust) => cust.id !== id
    );
    setSelectedWitnesses(updatedSelectedWitnesses);
  };

  const handleOpenModalLinkIncident = () => {
    setShowModalLinkIncident(true)
  };

  const handleCloseModalLinkIncident = () => {
    setShowModalLinkIncident(false)
  };

  const handleTrashLinkedIncident = (toDeleteId) => {
    toggleRowChecked(toDeleteId)
  };

  const handleAddMediaAtCreate = (mediaObj) => {
    const readyMediaObj = {
      ...mediaObj,
      id: makeId(mediaObj.description),
      description: mediaObj.description.trim(),
    };
    setFormData((prevFormData) => ({
      ...prevFormData,
      attachments: [...prevFormData.attachments, readyMediaObj]
    }))
  };

  const handleRemoveUnsavedMediaCreate = (unsavedId) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      attachments: prevFormData.attachments.filter((obj) => obj.id !== unsavedId)
    }))
  };

  const handleShowTrespassFormModal = (id) => {
    setTrespassCustomerID(id);
    openModalTrespass();
  };

  const handleShowCustomerDetailsFormModal = (id) => {
    setDetailsCustomerID(id);
    openModalCustomerDetails();
  };

  const handleAddSelfAsWitness = () => {
    setSelectedWitnesses((prevState) => {
      const isSelfAlreadyWitness = prevState.some(
        wit => wit.id === self.id
      );
      if(isSelfAlreadyWitness) {
        return prevState;
      };
      return [...prevState, self];
    });
  };

  const itemFormatterIncidentType = (item) => {
    return (
      <li key={item.id}>
        {item.title}
        <button
          style={{ paddingLeft: '8px' }}
          onClick={() => handleRemoveType(item.id)}
          aria-label={`Remove ${item.title}`}
          type="button"
        >
          <Icon icon="trash" size="medium" />
        </button>
      </li>
    );
  };

  const itemFormatterSelectedCustomers = (item) => {
    const notAvailable = intl.formatMessage({ id: "unknown-name-placeholder" });
    const firstName = item.firstName === '' ? notAvailable : item.firstName;
    const lastName = item.lastName === '' ? notAvailable : item.lastName;
    return (
      <li key={item.id}>
        {lastName}, {firstName}
        <button
          style={{ paddingLeft: '25px' }}
          onClick={() => handleRemoveSelectedCustomer(item.id)}
          type="button"
        >
          <Icon icon="trash" size="medium" /> <FormattedMessage id="remove-button"/>
        </button>
        {item.details || item.description ? (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowCustomerDetailsFormModal(item.id)}
            type="button"
          >
            <Icon icon="report" size="medium" /> 
            <FormattedMessage id="edit-details-button"/>
          </button>
        ) : (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowCustomerDetailsFormModal(item.id)}
            type="button"
          >
            <Icon icon="plus-sign" size="medium" /> 
             <FormattedMessage id="add-details-button"/>
          </button>
        )}
        {item.trespass ? (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowTrespassFormModal(item.id)}
            type="button"
          >
            <Icon icon="report" size="medium" /> 
            <FormattedMessage id="edit-trespass-button"/>
          </button>
        ) : (
          <button
            style={{ paddingLeft: '15px' }}
            onClick={() => handleShowTrespassFormModal(item.id)}
            type="button"
          >
            <Icon icon="plus-sign" size="medium" /> 
            <FormattedMessage id="add-trespass-button"/>
          </button>
        )}
      </li>
    );
  };

  const handleEditCustomWit = (witId) => {
    setCustWitEditID(witId)
    openModalCustomWitness()
  };

  const handleOpenCustomWitness = () => {
    openModalCustomWitness()
  };

  const itemFormatterSelectedWitnesses = (item) => {
    const isCustom = item.isCustom; 
    return (
      <li key={item.id}>
        {item.lastName}, {item.firstName}
        <button
          style={{ paddingLeft: '8px' }}
          onClick={() => handleRemoveSelectedWitness(item.id)}
          aria-label={`Remove ${item.lastName}, ${item.firstName}`}
          type="button"
        >
          <Icon icon="trash" size="medium" />
        </button>
        {isCustom && (
        <button 
          style={{ paddingLeft: '12px' }}
          onClick={() => handleEditCustomWit(item.id)}
          aria-label={`Edit ${item.lastName}, ${item.firstName}`}
          type="button"
        >
          <FormattedMessage id="edit-button"/>
        </button>)
        }
      </li>
    );
  };

  const handleOpenModalMedia = () => {
    openModalMedia();
  };

  const customersListLabel = intl.formatMessage(
    { id: 'customers-list-label' },
    { count: selectedCustomers.length }
  );

  const incidentTypesListLabel = intl.formatMessage(
    { id: 'incident-types-list-label' },
    { count: preparedIncidentTypes.length }
  );

  const witnessesListLabel = intl.formatMessage(
    { id: 'witnesses-list-label' },
    { count: selectedWitnesses.length,
      bold: (chunks) => (
        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
      ),
    },
  );

  const footer = (
    <PaneFooter
      renderStart={
        <Button onClick={handleDismiss}>
          <FormattedMessage id="cancel-button" />
        </Button>
      }
      renderEnd={
        <Button
          buttonStyle="primary"
          onClick={handleSubmit}
          disabled={!isFormDataValid()}
        >
          <FormattedMessage id="save-and-close-button" />
        </Button>
      }
    />
  );

  return (
   <>
    {idForMediaCreate && formDataArrayForMediaCreate && (
        <CreateMedia
          context="new"
          id={idForMediaCreate}
          formDataArray={formDataArrayForMediaCreate}
          handleCloseNewOnSuccess={handleCloseNewOnSuccess}
        />
      )}
    {postData && (
      <CreateReport
        data={postData}
        handleCloseNewOnSuccess={handleCloseNewOnSuccess}
      />
    )}

    {showDirtyFormModal && (
      <ModalDirtyFormWarn 
        handleKeepEditing={handleKeepEditing}
        handleDismissOnDirty={handleDismissOnDirty}
      />
    )}

    {isCreatingReport ? (
      <LoadingPane
        defaultWidth="fill"
        paneTitle={<FormattedMessage id="create-pane.loading-pane-submit-paneTitle" />}
      />
    ) : (
      <Pane
        dismissible
        defaultWidth="100%"
        paneTitle={<FormattedMessage id="create-pane.paneTitle" />}
        renderHeader={(renderProps) => (
          <PaneHeader
            {...renderProps}
            dismissible
            onClose={handleDismiss}
          />
        )}
        footer={footer}
      >

      <ModalAddMedia 
        context='create'
        handleAddMediaAtCreate={handleAddMediaAtCreate}
        />
      <ModalDescribeCustomer />
      <ModalSelectKnownCustomer />
      <ModalSelectWitness />
      <GetSelf />
      <ModalCustomWitness 
        custWitEditID={custWitEditID}
        />  

      <GetTrespassTemplates />
      <GetTrespassReasons />
      <GetLocations />
      <GetLocationsInService />
      <GetIncidentTypesDetails context='incidents'/>
      <ModalSelectIncidentTypes
        handleIncidentTypeToggle={handleIncidentTypeToggle}
        formDataIncidentTypes={formData.incidentTypes}
      />
      {trespassCustomerID && 
        <ModalTrespass 
          customerID={trespassCustomerID} 
          modalContext='create-mode'
          />
      }
      {detailsCustomerID && (
        <ModalCustomerDetails customerID={detailsCustomerID} />
      )}

      {showModalLinkIncident && (
        <ModalLinkIncident 
          toggleRowChecked={toggleRowChecked}
          ids={selectedIds}
          setIds={setSelectedIds}
          handleCloseModalLinkIncident={handleCloseModalLinkIncident}
        /> 
      )}

      <GetSummary
        ids={idsArray}
        onResult={setLinkedToSummaries}
      />

      <AccordionSet>
        <ExpandAllButton />
        <Accordion
          label={<FormattedMessage id="accordion-label-customer-information" />}
        >
        {selectedCustomers.length > 0 ? null 
        : <Row>
          <Col xs={2} style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px'}}>
            <Checkbox
              label={<FormattedMessage id="customer-not-available"/>}
              name='customerNa'
              onChange={handleCustomerNa} 
            />
          </Col>
        </Row>}
          
        {!isNoCustomer && ( 
          <>
          <Row>
            <Col xs={3}>
              <Button
                onClick={openModalSelectKnownCust}
                style={{ marginTop: '10px' }}
              >
                <FormattedMessage id="select-add-known-customer-button" />
              </Button>
            </Col>
          </Row>

          <Row>
            <Col xs={3} style={{ marginTop: '10px' }}>
              <Button onClick={openModalUnknownCust}>
                <FormattedMessage id="describe-add-unknown-customer-button" />
              </Button>
            </Col>
          </Row>

          <Row>
            <Col xs={9}>
              <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                <b>{customersListLabel}</b>
              </Label>
              <List
                listStyle="bullets"
                label={customersListLabel}
                items={selectedCustomers}
                isEmptyMessage={
                  <FormattedMessage
                    id="customers-list-is-empty-message"
                    values={{
                      bold: (chunks) => (
                        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
                      ),
                    }}
                  />
                }
                itemFormatter={itemFormatterSelectedCustomers}
              />
            </Col>
          </Row>
          </>
          )}
        </Accordion>

        <Accordion label={<FormattedMessage id="accordion-label-incident" />}>
          <Row>
            <Col xs={3}>
              <Select
                required
                label={
                  <FormattedMessage id="create-pane.location-select-label" />
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
                  <FormattedMessage id="create-pane.sub-location-select-label" />
                }
                name="subLocation"
                value={formData.subLocation}
                dataOptions={subLocationsDataOptions}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: '25px' }}>
            <Col xs={3}>
              <Datepicker
                required
                name="dateOfIncident"
                value={formData.dateOfIncident}
                label={
                  <FormattedMessage id="create-pane.date-of-incident-date-picker-label" />
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
                  <FormattedMessage id="create-pane.time-of-incident-date-picker-label" />
                }
                onChange={handleChange} 
              />
            </Col>

            <Col xs={2} style={{ marginTop: '25px' }}>
                <Checkbox 
                  label='Approximate time'
                  name='isApproximateTime'
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
                <FormattedMessage id="create-pane.select-add-incident-type-button" />
              </Button>
            </Col>
          </Row>

          <Row>
            <Col xs={4} style={{ paddingLeft: '20px' }}>
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
                        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
                      ),
                    }}
                  />
                }
                itemFormatter={itemFormatterIncidentType}
              />
            </Col>
          </Row>

          <Row style={{ marginTop: '25px' }}>
            <Col xs={6}>
              <Editor
              required
              label={<FormattedMessage id="create-pane-detailedDescriptionIncident-editor-label"/>}
              value={draftRef.current}
              onChange={handleEditorChange}
              onBlur={handleEditorBlur}
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
                onClick={handleOpenCustomWitness}
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
            <Col xs={6} style={{ paddingTop: '20px' }}>
              <Label style={{ marginTop: '5px' }} size="medium" tag="h2">
                <FormattedMessage
                  id="witnesses-list-label"
                  values={{
                    count: selectedWitnesses.length,
                    bold: (chunks) => <strong>{chunks}</strong>,
                  }}
                />
              </Label>

              <List
                listStyle="bullets"
                label={witnessesListLabel}
                items={selectedWitnesses}
                isEmptyMessage={
                  <FormattedMessage
                    id="witnesses-list-is-empty-message"
                    values={{
                      bold: (chunks) => (
                        <strong style={{ color: '#A12A2A' }}>{chunks}</strong>
                      ),
                    }}
                  />
                }
                itemFormatter={itemFormatterSelectedWitnesses}
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
          <Row style={{ margin: '25px' }}>
              <Col xs={1} style={{ visibility: 'hidden' }}></Col>
              {formData.attachments.map((attachment) => (
                <Col xs={2} key={attachment.id}>
                  <ThumbnailTempPreSave 
                    context='create'
                    contentType={attachment.contentType}
                    handleRemoveUnsavedMediaCreate={handleRemoveUnsavedMediaCreate}
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
              <Button onClick={handleOpenModalMedia}>
                <FormattedMessage id="add-media-button" />
              </Button>
            </Col>
          </Row>
        </Accordion>
      </AccordionSet>
    </Pane>
    )}
   </>
  );
};

export default CreatePane;