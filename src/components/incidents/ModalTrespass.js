import React, { useState, useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { decode } from 'html-entities';
import { FormattedMessage } from 'react-intl';
import {
  AccordionSet,
  Accordion,
  Button,
  Checkbox,
  Col,
  Datepicker,
  Editor,
  InfoPopover,
  Modal,
  ModalFooter,
  Pane,
  Paneset,
  Row,
  Select,
  TextField,
  AutoSuggest,
} from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import GetLocationsInService from '../../settings/GetLocationsInService'; 
import GetTrespassReasons from '../../settings/GetTrespassReasons';
import convertUTCISOToPrettyDate from './helpers/convertUTCISOToPrettyDate';
import {
  isDeclarationOfServiceEmpty,
  validateTrespass,
  hasTrespassReason
} from './helpers/validateTrespassDetails';
import { isSameHtml } from './helpers/isSameHtml.js';
import css from './ModalStyle.css';

const ModalTrespass = ({ 
  customerID, 
  allCustomers, // list of customers in EditPane context use of modal
  setAllCustomers,
  onStagedTrespassUpdate,
  onUpdateDeclaration = () => {}, // Only EditPane passes this prop
  updateDeclarationArray = [], // Only EditPane passes this prop
  modalContext = '', // Only CreatePane passes this prop
  customersWithoutDeclaration = new Set(), // Only EditPane passes this prop
  isNewlySelected
}) => {
  const {
    isModalTrespass,
    closeModalTrespass,
    selectedCustomers, // list of customers in CreatePane context use of modal
    setSelectedCustomers,
    locationsInService,
    trespassReasons
  } = useIncidents();

  const allowedReasonIds = useMemo(() => {
    const list = (trespassReasons ?? []).filter(r => !r.isSuppressed);
    return new Set(list.map(r => r.id));
  }, [trespassReasons]);

  const [localUpdateDeclaration, setLocalUpdateDeclaration] = useState(false);
  const reasonsSectionRef = useRef(null);
  const [trespassData, setTrespassData] = useState({
    dateOfOccurrence: '',
    exclusionOrTrespassBasedOn: [],
    witnessedBy: { witnesses: [] },
    endDateOfTrespass: '',
    declarationOfService: {
      date: '',
      placeSigned: '',
      title: '',
      signature: false,
    },
    description: ''
  });
  const [customersArray, setCustomersArray] = useState([]);
  const [workWithEdit, setWorkWithEdit] = useState(false);
  const [submitOk, setSubmitOk] = useState(false);
  const [useIncidentDesc, setUseIncidentDesc] = useState(true);
  const [formTouched, setFormTouched] = useState(false);
  // const [isNewlySelected, setIsNewlySelected] = useState(false);
  const shouldHideUpdateDeclaration = customersWithoutDeclaration?.has(customerID);
  const initializedByCustomerRef = useRef(new Set()); // remember who we've init
  const [trInputValue, setTrInputValue] = useState(''); // trespass reason input value
  const [trVisibleCount, setTrVisibleCount] = useState(5); // trespass reason vis count
  const [trsHasExpanded, setTrsHasExpanded] = useState(false); // track tresp-reason exp
  const trItems = useMemo(() => {
    const formattedTRitems = trespassReasons 
      ? trespassReasons
      .filter(tr => !tr.isSuppressed) // exclude suppressed
      .map((tr) => ({
        value: tr.id,
        label: tr.reason,
        isDefault: !!tr.isDefault
    }))
    : [{
      value: '', 
        label: <FormattedMessage 
          id="search-pane.trespass-reasons-label-no-loaded"
      />
    }];
    return formattedTRitems;
  }, [trespassReasons]);

  const defaultReasonObj = useMemo(() => {
    const defaultTR = trespassReasons?.find(r => r.isDefault);
    return defaultTR ? 
      {
        id: defaultTR.id,
        reason: defaultTR.reason
      } 
      : null; 
  }, [trespassReasons]);

  useEffect(() => {
    if (modalContext !== 'create-mode') return;
    if (!defaultReasonObj) return ;
    if (initializedByCustomerRef.current.has(customerID)) return; // bail if already initialized for this customer

    const hasSelection = (trespassData.exclusionOrTrespassBasedOn?.length ?? 0) > 0;

    if (!hasSelection) {
      setTrespassData(prev => ({
        ...prev, 
        exclusionOrTrespassBasedOn: [defaultReasonObj]
      }));
    }
  }, [
    modalContext, 
    defaultReasonObj, 
    customerID, 
    setTrespassData, 
    trespassData.exclusionOrTrespassBasedOn
  ]);

  /* 
    handle if not in create-mode and customer does NOT have a 
    trespass.exclusionOrTrespassBasedOn value, we still set a defaultReasonObj 
  */
  useEffect(() => {
    if (!defaultReasonObj) return ;
    if (initializedByCustomerRef.current.has(customerID)) return; 
    const hasSelection = (trespassData.exclusionOrTrespassBasedOn?.length ?? 0) > 0;

    if (!hasSelection) {
      setTrespassData(prev => ({
        ...prev, 
        exclusionOrTrespassBasedOn: [defaultReasonObj]
      }));
    }
  }, [
    defaultReasonObj, 
    customerID, 
    setTrespassData, 
    trespassData.exclusionOrTrespassBasedOn
  ]);

  const allTrespassReasons = useMemo(() => {
    const inVal = (trInputValue || '').toLowerCase();
    return trItems.filter(item => (item.label || '').toLowerCase().includes(inVal));
  }, [trItems, trInputValue]);

  const sortedTrespassReasons = useMemo(() => {
    // default first, then alpha by label
    const arr = [...allTrespassReasons];
    arr.sort((a, b) => (
      Number(b.isDefault) - Number(a.isDefault)
    ) || a.label.localeCompare(b.label));
    return arr;
  }, [allTrespassReasons]);

  const filteredTrespassReasons = useMemo(() => {
    return sortedTrespassReasons.slice(0, trVisibleCount)
  }, [sortedTrespassReasons, trVisibleCount]);

  const handleMoreTRsClick = () => {
    setTrVisibleCount((prevCount) => {
      return Math.min(prevCount + 5, sortedTrespassReasons.length)
    });
  };

  const loadMoreTRs = () => {
    handleMoreTRsClick();
    if (!trsHasExpanded) {
      setTrsHasExpanded(true);
    };
  };

  // A customer can only (re)declare if they have at least one current (non-suppressed) reason selected
  const isEligibleToRedeclare = useMemo(() => {
    const arr = trespassData.exclusionOrTrespassBasedOn || [];
    for (const item of arr) {
      const id = typeof item === 'string' ? item : item?.id;
      if (id && allowedReasonIds.has(id)) return true;
    }
    return false;
  }, [trespassData.exclusionOrTrespassBasedOn, allowedReasonIds]);

  const showUpdateCheckbox = modalContext !== 'create-mode' &&
    !isNewlySelected && (!shouldHideUpdateDeclaration || localUpdateDeclaration);

  const selectedObjs = trespassData.exclusionOrTrespassBasedOn || [];
  // const reasonsOk = hasTrespassReason(trespassData);
  // const showReasonError = !isEligibleToRedeclare && formTouched;

  const handleTRtoggle = (id, reason, checked) => {
    setTrespassData(prev => {
      const prevArr = prev.exclusionOrTrespassBasedOn || [];
      const next = checked
        // add 
        ? (prevArr.some(x => x?.id === id) ? prevArr : [...prevArr, { id, reason }])
        // remove by id
        : prevArr.filter(x => x?.id !== id);

      return { ...prev, exclusionOrTrespassBasedOn: next };
    });
    setFormTouched(true);
  };

  const handleTRFilterChange = (value) => {
    // console.log("@handleTRFilterChange - value: ", value)
    setTrInputValue(value);
  };

  const trContainerStyle = {
    maxHeight: trsHasExpanded ? '175px' : '125px',
    overflowX: 'clip',
    overflowY: 'auto',
    marginTop: '8px'
  };

  // setting customersArray with either allCustomers data OR selectedCustomers data
  useEffect(() => {
    if (allCustomers) {
      setWorkWithEdit(true);
      setCustomersArray(allCustomers); // setting if rendered via @EditPane
    } else if (selectedCustomers) {
      setCustomersArray(selectedCustomers); // setting if rendered via @CreatePane
    }
  }, [selectedCustomers, allCustomers]);

  useEffect(() => {  
    const valid = validateTrespass(trespassData);
    setSubmitOk(valid);
  }, [trespassData]);
  
  const rebuildFromParent = () => {
    const currentCustomer = (allCustomers || selectedCustomers || []).find(c => c.id === customerID);
    if (currentCustomer && currentCustomer.trespass) {
      const next = {
        dateOfOccurrence: convertUTCISOToPrettyDate(currentCustomer.trespass.dateOfOccurrence) || '',
        exclusionOrTrespassBasedOn: currentCustomer.trespass.exclusionOrTrespassBasedOn || [],
        endDateOfTrespass: convertUTCISOToPrettyDate(currentCustomer.trespass.endDateOfTrespass) || '',
        declarationOfService: {
          date: convertUTCISOToPrettyDate(currentCustomer.trespass.declarationOfService?.date) || '',
          placeSigned: currentCustomer.trespass.declarationOfService?.placeSigned || '',
          title: currentCustomer.trespass.declarationOfService?.title || '',
          signature: currentCustomer.trespass.declarationOfService?.signature || false,
        },
        description: currentCustomer.trespass.description || ''
      };

      setTrespassData(next);
      draftRef.current = next.description || '';
      const useDefault = (next.description || '').trim() === '';
      setUseIncidentDesc(useDefault);

      // recompute validity gating
      const hasAnyCurrentValidReason = (next.exclusionOrTrespassBasedOn || []).some(x => {
        const id = typeof x === 'string' ? x : x?.id;
        return id && allowedReasonIds.has(id);
      });
      setSubmitOk(validateTrespass(next));
      setFormTouched(!hasAnyCurrentValidReason);
      setLocalUpdateDeclaration(updateDeclarationArray.includes(customerID));
    } else {
      const empty = {
        dateOfOccurrence: '',
        exclusionOrTrespassBasedOn: [],
        witnessedBy: { witnesses: [] },
        endDateOfTrespass: '',
        declarationOfService: { date: '', placeSigned: '', title: '', signature: false },
      };
      setTrespassData(empty);
      draftRef.current = '';
      setUseIncidentDesc(true);
      setFormTouched(false);
      setSubmitOk(false);
      setLocalUpdateDeclaration(false);
    }
  };

  useEffect(() => {
    if (isModalTrespass) rebuildFromParent();
  }, [isModalTrespass]); 

  useEffect(() => {
    if (isModalTrespass) {
      setLocalUpdateDeclaration(updateDeclarationArray.includes(customerID));
    }
  }, [isModalTrespass, updateDeclarationArray, customerID]);

  const handleDismiss = () => {
    rebuildFromParent();
    setWorkWithEdit(false);
    closeModalTrespass();
  };

  useEffect(() => {
    if (formTouched) {
      setSubmitOk(validateTrespass(trespassData))
    }
  }, [formTouched, trespassData]);

  const locationDataOptions = useMemo(() => {
    const defaultValueLabel = [{ 
      value: '', 
      label: <FormattedMessage 
        id="create-pane.locationDataOptions-label-select-location"/> 
     }];
     const formattedLocations = locationsInService 
      ? locationsInService.map((loc) => ({
          value: loc.id, 
          label: loc.location
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

  const handleChange = (event) => {
    const { name, value, checked } = event.target;
    if (name === 'exclusionOrTrespassBasedOn') {
      handleExclusionCheckboxChange(event);
    } else if (name === 'declarationOfService.signature') {
      setTrespassData((prevData) => ({
        ...prevData,
        declarationOfService: {
          ...prevData.declarationOfService,
          signature: checked,
        },
      }));
    } else if (name === 'declarationOfService.placeSigned') {
      setTrespassData((prevData) => ({
        ...prevData,
        declarationOfService: {
          ...prevData.declarationOfService,
          placeSigned: value,
        },
      }));
    } else if (name === 'declarationOfService.date') {
      setTrespassData((prevData) => ({
        ...prevData,
        declarationOfService: {
          ...prevData.declarationOfService,
          date: value,
        },
      }));
    } else if (name === 'declarationOfService.title') {
      setTrespassData((prevData) => ({
        ...prevData,
        declarationOfService: {
          ...prevData.declarationOfService,
          title: value,
        },
      }));
    } else {
      setTrespassData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setFormTouched(true);
  };

  /*
    Keep current HTML in a ref so keystrokes update w/out setting state.
    This prevents react-quill's cleanup <-> setState feedback loop that otherwise
    causes maximum update depth exceeded error when links are present in editor.
  */
  // local unsanitized buffer - doesn't trigger React re-renders
  const draftRef = useRef('');

  // fire on every key-press but only mutautes the ref
  const handleEditorChange = (content) => {
    draftRef.current = content; 
    setFormTouched(true);
  };

  // commits once, with sanitized HTML 
  const handleEditorBlur = () => {
    const sanitizedContent = DOMPurify.sanitize(draftRef.current);
    setTrespassData(prev => 
      isSameHtml(prev.description, sanitizedContent) 
      ? prev 
      : { ...prev, description: sanitizedContent}
    );
  };

  const handleSave = () => {
    const updatedTrespassData = { ...trespassData };
    const updatedCustomerArray = customersArray.map((cust) => {
      if (cust.id === customerID) {
        // if no end date of trespass delete it
        if (trespassData.endDateOfTrespass === '') {
          delete updatedTrespassData.endDateOfTrespass;
        };
        // if no declaration of service delete it
        if (
          isDeclarationOfServiceEmpty(updatedTrespassData.declarationOfService)
        ) {
          delete updatedTrespassData.declarationOfService;
        };
        if (useIncidentDesc) {
          // using default, always delete custom override
          delete updatedTrespassData.description;
        } else {
          const sanitizedContent = DOMPurify.sanitize(draftRef.current);
          const rawText = decode(sanitizedContent)
            .replace(/<\/?[^>]+>/g, '') // strip tags
            .trim();

          if (rawText === '') {
            // Editor visually empty - treat like using default
            delete updatedTrespassData.description; 
          } else {
            // Editor has meaningful input - persist
            updatedTrespassData.description = sanitizedContent;
          };
        }
        // const object = {...cust, trespass: updatedTrespassData};

        return {
          ...cust,
          trespass: updatedTrespassData,
        };
      }
      return cust;
    });

    onStagedTrespassUpdate?.(customerID, updatedTrespassData);
    const parentHas = updateDeclarationArray.includes(customerID);
    if (localUpdateDeclaration !== parentHas) {
      onUpdateDeclaration(customerID)
    };

    if (workWithEdit) {
      // setting via @EditPane
      setAllCustomers(updatedCustomerArray);
    } else {
      // setting via @CreatePane
      setSelectedCustomers(updatedCustomerArray);
    };
    setTrespassData({
      dateOfOccurrence: '',
      exclusionOrTrespassBasedOn: [],
      witnessedBy: { witnesses: [] },
      endDateOfTrespass: '',
      declarationOfService: {
        date: '',
        placeSigned: '',
        title: '',
        signature: false,
      },
      description: ''
    })
    draftRef.current = '';
    setWorkWithEdit(false);
    closeModalTrespass();
  };

  if (!isModalTrespass) {
    return null;
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={handleSave}
        buttonStyle="primary"
        marginBottom0
        // must pass validation and have more than 1 current reason selected
        disabled={!(submitOk && isEligibleToRedeclare)}
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleDismiss}> 
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        maxHeight: '90vh', 
        minHeight: '500px' 
      }}
      open
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-trespass-label" />}
      size="large"
      onClose={handleDismiss}
      footer={footer}
      contentClass={css.modalContent}
    >
      <GetLocationsInService />
      <GetTrespassReasons />

      <Paneset style={{ height: '100%', flexGrow: 1 }}>
        <Pane 
        defaultWidth="100%"
        style={{ overflowY: 'auto', flexGrow: 1  }} 
        >
          <AccordionSet>
            <Accordion
              label={
                <FormattedMessage id="modal-trespass.accordion-trespass-details-label" />
              }
            >
              <Row>
                <Col xs={4}>
                  <AutoSuggest 
                    value={trInputValue}
                    items={[]} // using as filter input
                    onChange={handleTRFilterChange}
                    menuStyle={{ display: 'none' }}
                    renderValue={(val) => val || ''} // render item in input field
                  />
                </Col>
              </Row>

              <Row xs={12} style={{ marginLeft: '10px' }}>
                <Col>
                <div style={trContainerStyle} ref={reasonsSectionRef}>
                  {filteredTrespassReasons.map((item) => (
                    <Checkbox 
                      key={item.value}
                      label={item.label}
                      value={item.value}
                      checked={selectedObjs.some(sel => sel?.id === item.value)}
                      onChange={(e) => handleTRtoggle(item.value, item.label, e.target.checked)}
                    />
                  ))}
                </div>

                <div style={{ marginTop: '2px' }}>
                  {trVisibleCount < allTrespassReasons.length && (
                    <Button
                      onClick={loadMoreTRs}
                    >
                      <FormattedMessage id="more-button" />
                    </Button>
                  )}
                </div>
                </Col>
              </Row>

              <Row style={{ marginTop: '25px' }}>
                <Col xs={3}>
                <Checkbox
                    name="useIncidentDescription"
                    label={
                      <FormattedMessage id="modal-trespass-checkbox-use-incident-description" />
                    }
                    checked={useIncidentDesc}
                    onChange={() => setUseIncidentDesc(prev => !prev)}
                  />
                </Col>
                <Col xs={1}>
                    <InfoPopover 
                      content="Uncheck this box to provide a Trespass description different than the incident description on the trespass document."
                      iconSize='medium'
                    />
                </Col>
              </Row>

             {!useIncidentDesc && (
               <Row style={{ marginTop: '25px' }}>
                <Col xs={8}>
                    <Editor 
                      label='Trespass description'
                      value={draftRef.current}
                      onChange={handleEditorChange}
                      onBlur={handleEditorBlur}
                    />
                </Col>
              </Row>
             )}

              <Row style={{ marginTop: '25px' }}>
                <Col xs={3}>
                  <Datepicker
                    label={
                      <FormattedMessage id="modal-trespass.datepicker-end-date-trespass" />
                    }
                    name="endDateOfTrespass"
                    value={trespassData.endDateOfTrespass}
                    onChange={handleChange}
                  />
                </Col>
              </Row>
            </Accordion>

            <Accordion
              label={
                <FormattedMessage id="modal-trespass.accordion-declaration-of-service-label" />
              }
            >
              <Row style={{ marginTop: '25px' }}>
                <Col xs={3}>
                  <Datepicker
                    label={
                      <FormattedMessage id="modal-trespass.datepicker-date-served" />
                    }
                    name="declarationOfService.date"
                    value={
                      trespassData.declarationOfService
                        ? trespassData.declarationOfService.date
                        : ''
                    }
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={3}>
                  <Select
                    label={
                      <FormattedMessage id="modal-trespass.select-place-signed" />
                    }
                    dataOptions={locationDataOptions}
                    name="declarationOfService.placeSigned"
                    value={
                      trespassData.declarationOfService
                        ? trespassData.declarationOfService.placeSigned
                        : ''
                    }
                    onChange={handleChange}
                  />
                </Col>
                <Col xs={3}>
                  <TextField
                    label={
                      <FormattedMessage id="modal-trespass.textField-title" />
                    }
                    name="declarationOfService.title"
                    value={
                      trespassData.declarationOfService
                        ? trespassData.declarationOfService.title
                        : ''
                    }
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              <Row style={{ 
                  marginTop: '25px',  
                  marginBottom: modalContext === 'create-mode' || isNewlySelected || shouldHideUpdateDeclaration ? '120px' : '0'
                  }}>
                <Col xs={3}>
                  <Checkbox
                    label={
                      <FormattedMessage id="modal-trespass.checkbox-signed" />
                    }
                    name="declarationOfService.signature"
                    checked={
                      trespassData.declarationOfService
                        ? trespassData.declarationOfService.signature
                        : false
                    }
                    value={
                      trespassData.declarationOfService
                        ? trespassData.declarationOfService.signature
                        : false
                    }
                    onChange={handleChange}
                  />
                </Col>
              </Row>

              {showUpdateCheckbox && (
                  <Row style={{ marginTop: '5px', marginBottom: '120px' }}>
                    <Col xs={3}>
                      <Checkbox
                        label={
                          <FormattedMessage id="modal-trespass.checkbox-update-declaration" />
                        }
                        // must have a valid, current (non-suppressed) reason AND modal is otherwise valid
                        disabled={!submitOk || !isEligibleToRedeclare}
                        name="updateDeclaration"
                        // checked={updateDeclarationArray.includes(customerID)}
                        checked={localUpdateDeclaration}
                        // onChange={() => onUpdateDeclaration(customerID)}
                        onChange={() => setLocalUpdateDeclaration(prev => !prev)}
                      />
                    </Col>
                    <Col>
                     {!isEligibleToRedeclare && (
                        <div style={{ marginTop: 6 }}>
                          <InfoPopover
                            iconSize="medium"
                            content={
                              <FormattedMessage
                                id="edit-pane.update-declaration-requires-valid-reason"
                              />
                            }
                          />
                        </div>
                      )}
                    </Col>
                  </Row>
                )}
            </Accordion>
          </AccordionSet>
        </Pane>
      </Paneset>
    </Modal>
  );
};

ModalTrespass.propTypes = {
  customerID: PropTypes.string.isRequired,
  allCustomers: PropTypes.array,
  setAllCustomers: PropTypes.func,
  onStagedTrespassUpdate: PropTypes.func,
  onUpdateDeclaration: PropTypes.func,
  updateDeclarationArray: PropTypes.array,
  modalContext: PropTypes.string,
  customersWithoutDeclaration: PropTypes.instanceOf(Set)
};
export default ModalTrespass;