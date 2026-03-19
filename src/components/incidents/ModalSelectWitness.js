import React, { useEffect, useState } from 'react';
import { useIntl, FormattedMessage } from 'react-intl';
import { useStripes } from '@folio/stripes/core';
import {
  Button,
  Icon,
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
import SearchCustomerOrWitness from './SearchCustomerOrWitness';
import ProfilePicture from './helpers/ProfilePicture/ProfilePicture.js';
import GetPatronGroups from './GetPatronGroups';

const ModalSelectWitness = ({ 
  context,
  setFormData, 
  formData, 
  setRemovedWitnessIds, 
  removedWitnessIds}) => {
  const stripes = useStripes();
  const intl = useIntl();
  const [patronGroups, setPatronGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [search, setSearch] = useState('');

  const {
    isModalSelectWitness,
    closeModalSelectWitness,
    isLoadingSearch,
    selectedWitnesses,
    setSelectedWitnesses,
    setCustomers,
    customers, // response array
  } = useIncidents();

  const hasViewProfilePicturePerm = stripes.hasPerm('ui-users.profile-pictures.view');

  let endOflistTotal = 0;

  // set end of list value
  if (customers) {
    endOflistTotal = customers.length;
  };

  const handleChange = (event) => {
    const term = event.target.value;
    setSearchTerm(term);
  };

  const handleSearchSubmit = () => {
    setSearch(searchTerm.trim());
  };

  // toggle handler for context of edit
  const handleToggleWitness = (data) => {
    const isInstanceWitness = formData.incidentWitnesses.some(wit => wit.id === data.id);
    const isRemovedWitness = removedWitnessIds.includes(data.id);
    if (isInstanceWitness && !isRemovedWitness) {
      setFormData(prevFormData => ({
        ...prevFormData,
        incidentWitnesses: prevFormData.incidentWitnesses.filter(wit => wit.id !== data.id)
      }));
      setRemovedWitnessIds(prev => [...prev, data.id]); //mark as removed
      return;
    };
    // handle adding / removing from selectedWitnesses
    setSelectedWitnesses((prevState) => {
      const index = prevState.findIndex((cust) => cust.id === data.id);
      if (index > -1) {
        // remove witness from selectedWitnesses
        return prevState.filter((cust) => cust.id !== data.id);
      } else {
        // add witness to selectedWitnesses
        return [...prevState, data];
      }
    });
    // handle if instance wit removed, remove from removedWitnessIds
    // so can be treated as a newly selected witness
    if(isRemovedWitness) {
      setRemovedWitnessIds(prev => prev.filter(id => id !== data.id))
    };
    // allow keyboard only users immediate access to the close button on select
    document.getElementById('close-continue-button').focus();
  };

  const handleSave = () => {
    closeModalSelectWitness();
    setCustomers([]);
    setSearch('');
  };

  const handleDismissClose = () => {
    closeModalSelectWitness();
    setCustomers([]);
    setSearch('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // formatter for context of edit
  const resultsFormatter = {
    active: (item) => {
      return <p>{item.active ? 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-active"/>) 
        : 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-inactive"/>)}
      </p>;
    },
    name: (item) => {
      if (item.middleName && item.middleName !== '') {
        return `${item.lastName}, ${item.firstName} ${item.middleName}`;
      } else {
        return `${item.lastName}, ${item.firstName}`;
      }
    },
    patronGroup: (item) => {
      const patronGroupName = patronGroups.find((pg) => pg.id === item.patronGroup);
      return patronGroupName ? patronGroupName.group : null;
    },
    id: (item) => {
      const isWitnessSelected = selectedWitnesses.some(
        (cust) => cust.id === item.id
      );
      const isInstanceWitness = formData.incidentWitnesses.some(
        (wit) => wit.id === item.id
      );
      const isRemovedWitness = removedWitnessIds.includes(item.id);
      const showCheckMark = (isWitnessSelected || isInstanceWitness) && !isRemovedWitness;
      const buttonStyle = showCheckMark ? 'success' : 'primary';
      const buttonText = showCheckMark ? <Icon icon="check-circle" /> : 'Add';
      const custData = {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        barcode: item.barcode,
      };
      return (
        <Button
          onClick={() => handleToggleWitness(custData)}
          buttonStyle={buttonStyle}
        >
          {buttonText}
        </Button>
      );
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

  const handleToggleWitnessCreate = (data) => {
    setSelectedWitnesses((prevState) => {
      const index = prevState.findIndex((cust) => cust.id === data.id);
      if (index > -1) {
        // remove witness from selectedWitnesses
        return prevState.filter((cust) => cust.id !== data.id);
      } else {
        // add witness to selectedWitnesses
        return [...prevState, data];
      }
    });
    // allow keyboard only users immediate access to the close button on select
    document.getElementById('close-continue-button').focus();
  };


  // formatter for context of create
  const resultsFormatterCreate = {
    active: (item) => {
      return <p>{item.active === true ?  
        (<FormattedMessage id="modal-select-customer.resultsFormatter-active"/>) 
        : 
        (<FormattedMessage id="modal-select-customer.resultsFormatter-inactive"/>)}
      </p>;
    },
    name: (item) => {
      if (item.middleName && item.middleName !== '') {
        return `${item.lastName}, ${item.firstName} ${item.middleName}`;
      } else {
        return `${item.lastName}, ${item.firstName}`;
      }
    },
    patronGroup: (item) => {
      const patronGroupName = patronGroups.find((pg) => pg.id === item.patronGroup);
      return patronGroupName ? patronGroupName.group : null;
    },
    id: (item) => {
      const isWitnessSelected = selectedWitnesses.some(
        (cust) => cust.id === item.id
      );
      const buttonStyle = isWitnessSelected ? 'success' : 'primary';
      const buttonText = isWitnessSelected ? (
        <Icon icon="check-circle" />
      ) : (
        'Add'
      );
      const custData = {
        id: item.id,
        firstName: item.firstName,
        lastName: item.lastName,
        barcode: item.barcode,
      };
      return (
        <Button
          onClick={() => handleToggleWitnessCreate(custData)}
          buttonStyle={buttonStyle}
        >
          {buttonText}
        </Button>
      );
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
    { id: `modal-select-witness.results-pane.paneSubTitle` },
    { count: customers.length }
  );

  if (!isModalSelectWitness) {
    return null;
  };

  const renderHeader = (renderProps) => (
    <PaneHeader {...renderProps} paneSub={resultCount} />
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

  const columnWidths = {
    patronGroup: '110px',
    barcode: '130px',
    profilePicLinkOrUUID: '120px'
  }

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
      label={<FormattedMessage id="modal-select-witness.paneTitle" />}
      size="large"
      onClose={handleDismissClose}
      footer={footer}
      contentClass={css.modalContent}
    >
      {search && <SearchCustomerOrWitness term={search} />}
      <GetPatronGroups setPatronGroups={setPatronGroups}/>

      <div className={css.modalBody}>
        <Paneset style={{ height: '100%', flexGrow: 1 }}>
        <Pane
          paneTitle={<FormattedMessage id="search-pane.paneTitle" />}
          defaultWidth="30%"
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
              <FormattedMessage id="modal-select-witness.loading-pane-paneTitle" />
            }
          />
        ) : (
          <Pane
            paneTitle={
              <FormattedMessage id="modal-select-witness.results-pane-paneTitle" />
            }
            defaultWidth="80%"
            style={{ overflowY: 'auto', flexGrow: 1  }}
            renderHeader={renderHeader}
          >
            <div className={css.mclContainer}>
              <MultiColumnList
                autosize
                virtualize
                totalCount={endOflistTotal}
                contentData={customers}
                visibleColumns={hasViewProfilePicturePerm ? [
                  'name', 
                  'active', 
                  'patronGroup', 
                  'barcode', 
                  'profilePicLinkOrUUID',
                  'id'
                ] : [
                  'name', 
                  'active', 
                  'patronGroup', 
                  'barcode', 
                  'id'
                ]}
                columnMapping={{
                  name: <FormattedMessage id="column-mapping.name" />,
                  active: <FormattedMessage id="column-mapping.active" />,
                  patronGroup: <FormattedMessage id="column-mapping.patronGroup" />,
                  barcode: <FormattedMessage id="column-mapping.barcode" />,
                  profilePicLinkOrUUID: <FormattedMessage id="column-mapping.profilePicture" />,
                  id: 'Add',
                }}
                formatter={context === 'edit' ? resultsFormatter : resultsFormatterCreate}
                columnWidths={columnWidths}
              />
            </div>
          </Pane>
        )}
      </Paneset>
      </div>
    </Modal>
  );
};

export default ModalSelectWitness;