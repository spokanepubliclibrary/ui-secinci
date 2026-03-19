import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, Switch, Route } from 'react-router-dom';
import {
  Button,
  Col,
  NavList,
  NavListItem,
  NavListSection,
  Pane,
  PaneHeader,
  Paneset,
  Row,
} from '@folio/stripes/components';
// import GetIncidentTypesIds from './GetIncidentTypesIds';
import GetIncidentTypesDetails from './GetIncidentTypesDetails';
import IncidentTypeDetailsPane from './IncidentTypeDetailsPane';
import IncidentTypeEditPane from './IncidentTypeEditPane';
import NewIncidentTypePane from './NewIncidentTypePane';
import { useIncidents } from '../contexts/IncidentContext';

const IncidentTypesPaneset = () => {
  const { incidentTypesNamesIdsList } = useIncidents();
  const history = useHistory();
  const [typesList, setTypesList] = useState([]);

  const sortTypesList = (responseTypesList) => {
    const sorted = responseTypesList.sort((a, b) =>  {  
      // parse 'title' of object into numeric parts
      const parseTitle = (title) => {
        // split by any non-numeric character, filter boolean for empty str, map number ensure each part into Number
        return title.split(/[^\d]+/).filter(Boolean).map(Number);
      };
      
      const aParts = parseTitle(a.title);
      const bParts = parseTitle(b.title);
      // itereate parts of both titles
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aValue = aParts[i] || 0; //if fewer parts the treated as 0
        const bValue = bParts[i] || 0;
        // if different
        if (aValue !== bValue) {
          // determine sort order, if a is less than b, negative value is returned, and a comes before b
          // if a is greater than b, func returns positive value and a comes after b 
          return aValue - bValue;
        };
      };
      // if all parts equal or no difference found, return 0, no change in order
      return 0;
    });
    return sorted;
  };

  // const handleGetTypesList = (list) => {
  //   const sortedList = sortTypesList(list);
  //   setTypesList(sortedList);
  // };

  useEffect(() => {
    const sortedList = sortTypesList(incidentTypesNamesIdsList);
    setTypesList(sortedList);
  }, [incidentTypesNamesIdsList])

  const handleShowDetails = (id) => {
    history.push(`/settings/incidents/types/${id}`);
  };

  const handleCloseDetails = () => {
    history.push(`/settings/incidents/types`);
  };

  const handleShowEdit = (id) => {
    history.push(`/settings/incidents/types/${id}/edit`);
  };

  const handleCloseEdit = () => {
    history.push(`/settings/incidents/types`);
  };

  const handleNew = () => {
    history.push(`/settings/incidents/types/new`);
  };

  const handleCloseNew = () => {
    history.push(`/settings/incidents/types`);
  };
  // <FormattedMessage id="settings.incident-types-new-button"/>
  return (
    <Paneset>
      <Pane
        paneTitle={<FormattedMessage id="settings.incident-types.paneTitle" />}
        defaultWidth="fill"
        renderHeader={(renderProps) => <PaneHeader {...renderProps} />}
      >
        <Row>
          <Col xs={10}>
            <Button buttonStyle="primary" onClick={handleNew}>
              <FormattedMessage id="settings.incident-types-new-button" />
            </Button>
          </Col>
        </Row>

      {
        typesList.length > 0 ? (
          <NavList>
            <NavListSection>
              {typesList.map((type, index) => (
                <NavListItem
                  key={index}
                  onClick={() => handleShowDetails(type.id)}
                >
                  {type.title}
                </NavListItem>
              ))}
            </NavListSection>
          </NavList>
        ) : (
          <p>
          <FormattedMessage 
            id="settings.incident-types-default-if-no-list"/>
          </p>
        )
      }

      </Pane>
      {/* <GetIncidentTypesIds 
        contextTypeProp="incident-types-paneset"
        handleGetTypesList={handleGetTypesList} 
        /> */}
      <GetIncidentTypesDetails 
        context='settings'
      />
      <Switch>
        <Route
          exact
          path="/settings/incidents/types/new"
          render={(props) => (
            <NewIncidentTypePane {...props} handleCloseNew={handleCloseNew} />
          )}
        />
        <Route
          exact
          path="/settings/incidents/types/:id"
          render={(props) => (
            <IncidentTypeDetailsPane
              {...props}
              handleCloseDetails={handleCloseDetails}
              handleShowEdit={handleShowEdit}
            />
          )}
        />
        <Route
          exact
          path="/settings/incidents/types/:id/edit"
          render={(props) => (
            <IncidentTypeEditPane
              {...props}
              handleCloseEdit={handleCloseEdit}
            />
          )}
        />
      </Switch>
    </Paneset>
  );
};

export default IncidentTypesPaneset;