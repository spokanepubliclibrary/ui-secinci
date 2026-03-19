import React, { useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useStripes } from '@folio/stripes/core';
import {
  Button,
  Icon,
  KeyValue,
  LoadingPane,
  Modal,
  ModalFooter,
  MultiColumnList,
  Pane,
  Paneset,
  PaneHeader,
  SearchField,
} from '@folio/stripes/components';
import css from './ModalStyle.css';
import { useIncidents } from '../../contexts/IncidentContext';
import ProfilePicture from './helpers/ProfilePicture/ProfilePicture.js';
import SearchCustomerOrWitness from './SearchCustomerOrWitness';

const ModalSelectKnownCustomer = ({ 
  setFormData, 
  formData, 
  setRemovedCustomerIds, 
  removedCustomerIds, 
  context }) => {
  const stripes = useStripes();
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');

  const {
    isModalSelectKnownCustOpen,
    closeModalSelectKnownCust,
    setCustomers, 
    customers, // response array
    isLoadingSearch,
    selectedCustomers,
    setSelectedCustomers,
  } = useIncidents();

  const hasViewProfilePicturePerm = stripes.hasPerm('ui-users.profile-pictures.view');

  if (!isModalSelectKnownCustOpen) {
    return null;
  }

  let endOflistTotal = 0;

  if (customers) {
    endOflistTotal = customers.length;
  }

  const handleChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const handleSearchSubmit = () => {
    setSearch(searchTerm.trim());
  };

  // toggle handler in context of edit
  const handleToggleCustomer = (data) => {
    const isInstanceCustomer = formData.customers.some(cust => cust.id === data.id);
    const isRemovedCustomer = removedCustomerIds.includes(data.id);
    // handle remove instance customer
    if (isInstanceCustomer && !isRemovedCustomer) {
      setFormData(prevFormData => ({
        ...prevFormData,
        customers: prevFormData.customers.filter(cust => cust.id !== data.id)
      }));
      setRemovedCustomerIds(prev => [...prev, data.id]); //mark as removed
      return; 
    };
    // handle adding / removing from selected customers
    setSelectedCustomers((prevState) => {
      console.log("setSelectedCustomers - prevState --> ", JSON.stringify(prevState, null, 2))
      const index = prevState.findIndex((cust) => cust.id === data.id);
      if (index > -1) {
        // remove customer from selectedCustomers
        return prevState.filter((cust) => cust.id !== data.id);
      } else {
        // add customer to selectedCustomers
        return [...prevState, data];
      }
    });
    // if customer previously removed, 
    // this treats selection as new selected customer 
    // and remove from removedCustomerIds
    if(isRemovedCustomer) {
      setRemovedCustomerIds(prev => prev.filter(id => id !== data.id));
    };
    // allow keyboard only users immediate access to the close button on select
    document.getElementById('close-continue-button').focus();
  };

  // toggle handler in context of create
  const handleToggleCustomerCreate = (data) => {
    setSelectedCustomers((prevState) => {
      const index = prevState.findIndex((cust) => cust.id === data.id);
      if (index > -1) {
        // remove customer from selectedCustomers
        return prevState.filter((cust) => cust.id !== data.id);
      } else {
        // add customer to selectedCustomers
        return [...prevState, data];
      }
    });
    // allow keyboard only users immediate access to the close button on select
    document.getElementById('close-continue-button').focus();
  };


  const handleSave = () => {
    closeModalSelectKnownCust();
    setCustomers([]);
    setSearch('');
  };

  const handleDismissClose = () => {
    closeModalSelectKnownCust();
    setCustomers([]);
    setSearch('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // results formatter in context of edit
  const resultsFormatter = {
    active: (item) => {
      const isActive = item.active === true;
      return <p>{isActive ? 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-active"/>) 
        : 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-inactive"/>)}
      </p>;
    },
    id: (item) => {
      const isCustSelected = selectedCustomers.some(
        (cust) => cust.id === item.id
      );
      const isInstanceCustomer = formData.customers.some(
        (cust) => cust.id === item.id
      );
      const isRemovedCustomer = removedCustomerIds.includes(item.id);
      const showCheckMark = (isCustSelected || isInstanceCustomer) && !isRemovedCustomer; 
      const buttonStyle = showCheckMark ? 'success' : 'primary';
      const buttonText = showCheckMark ? <Icon icon="check-circle" /> : 'Add';
      const custData = {
        id: item.id,
        lastName: item.lastName,
        firstName: item.firstName,
        barcode: item.barcode,
        registered: true,
      };
      return (
        <Button
          onClick={() => handleToggleCustomer(custData)}
          buttonStyle={buttonStyle}
        >
          {buttonText}
        </Button>
      );
    },
    name: (item) => {
      if (item.middleName && item.middleName !== '') {
        return `${item.lastName}, ${item.firstName} ${item.middleName}`;
      } else {
        return `${item.lastName}, ${item.firstName}`;
      }
    },
    profilePicLinkOrUUID: (item) => {
      return (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',   // horizontal
          alignItems: 'center'        // vertical
        }}>
          {/* fixed-size box to prevent overflow/shift */}
          <div 
            style={{ 
              width: 100, 
              height: 100, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
            <ProfilePicture profilePictureLink={item.profilePicLinkOrUUID} />
          </div>
        </div>
      )
    }
  };

  // results formatter in context of create
  const resultsFormatterCreate = {
   active: (item) => {
      return <p>{item.active ? 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-active"/>) 
        : 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-inactive"/>)}
      </p>;
    },
   id: (item) => {
      const isCustSelected = selectedCustomers.some(
        (cust) => cust.id === item.id
      );
      const buttonStyle = isCustSelected ? 'success' : 'primary';
      const buttonText = isCustSelected ? <Icon icon="check-circle" /> : 'Add';
      const custData = {
        id: item.id,
        lastName: item.lastName,
        firstName: item.firstName,
        barcode: item.barcode,
        registered: true,
      };
      return (
        <Button
          onClick={() => handleToggleCustomerCreate(custData)}
          buttonStyle={buttonStyle}
        >
          {buttonText}
        </Button>
      );
    },
    name: (item) => {
      if (item.middleName && item.middleName !== '') {
        return `${item.lastName}, ${item.firstName} ${item.middleName}`;
      } else {
        return `${item.lastName}, ${item.firstName}`;
      }
    },
    profilePicLinkOrUUID: (item) => {
      return (
        <div style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',   // horizontal
          alignItems: 'center'        // vertical
        }}>
          {/* fixed-size box to prevent overflow/shift */}
          <div 
            style={{ 
              width: 100, 
              height: 100, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
            <ProfilePicture profilePictureLink={item.profilePicLinkOrUUID} />
          </div>
        </div>
      )
    }
  };

  const isFormDataPresent = () => {
    const isTermValid = searchTerm && searchTerm.trim() !== '';
    return isTermValid;
  };

  const resultCount = intl.formatMessage(
    { id: `modal-select-customer.results-pane.paneSubTitle` },
    { count: customers.length }
  );

  const renderHeader = (renderProps) => (
    <PaneHeader
      {...renderProps}
      paneTitle={<FormattedMessage id="modal-select-customer.paneTitle" />}
      paneSub={resultCount}
    />
  );

  const footer = (
    <ModalFooter>
      <Button
        id="close-continue-button"
        onClick={handleSave}
        buttonStyle="primary"
        marginBottom0
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleDismissClose}>
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        minHeight: '550px',
        height: '80%', // allows modal to grow/shrink based on content
        maxHeight: '300vh', 
        maxWidth: '400vw', // modal width responsive to viewport width
        width: '70%' // modal width adjusts based on content and window size
      }}
      open
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-select-customer.paneTitle" />}
      size="large"
      onClose={handleDismissClose}
      footer={footer}
      contentClass={css.modalContent}
    >
    <div className={css.modalBody}>
        {search && <SearchCustomerOrWitness term={search} />}

      <Paneset style={{ height: '100%', flexGrow: 1 }}>
        <Pane
          paneTitle={
            <FormattedMessage id="modal-select-customer.search-pane.paneTitle" />
          }
          defaultWidth="25%"
        >
          <SearchField
            placeholder="Name or barcode"
            value=""
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <Button 
            disabled={!isFormDataPresent()}
            onClick={handleSearchSubmit}
            >
            <FormattedMessage id="search-button" />
          </Button>
        </Pane>

        {isLoadingSearch ? (
          <LoadingPane
            defaultWidth="fill"
            paneTitle={
              <FormattedMessage id="modal-select-customer.loading-pane-paneTitle" />
            }
          />
        ) : (
          <Pane
            paneTitle={
              <FormattedMessage id="modal-select-customer.results-pane-paneTitle" />
            }
            defaultWidth="75%"
            style={{ overflowY: 'auto', flexGrow: 1  }}
            renderHeader={renderHeader}
          >
            <div className={css.mclContainer}>
              <MultiColumnList
                autosize
                virtualize
                totalCount={endOflistTotal}
                contentData={customers}
                columnWidths={{ profilePicLinkOrUUID: '120px' }}
                visibleColumns={hasViewProfilePicturePerm ? [
                  'name', 
                  'active', 
                  'barcode', 
                  'profilePicLinkOrUUID',
                  'id'
                ] : [
                  'name', 
                  'active', 
                  'barcode', 
                  'id'
                ]}
                columnMapping={{
                  name: <FormattedMessage id="column-mapping.name" />,
                  active: <FormattedMessage id="column-mapping.active" />,
                  barcode: <FormattedMessage id="column-mapping.barcode" />,
                  profilePicLinkOrUUID: <FormattedMessage id="column-mapping.profilePicture" />,
                  id: 'Add',
                }}
                formatter={context === 'edit' ? resultsFormatter : resultsFormatterCreate}
              />
            </div>
          </Pane>
        )}
      </Paneset>
      </div>
    </Modal>
  );
};

export default ModalSelectKnownCustomer;