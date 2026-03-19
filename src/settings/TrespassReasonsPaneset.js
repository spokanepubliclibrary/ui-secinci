
import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory, Switch, Route, useLocation } from 'react-router-dom';
import {
  Button,
  Checkbox,
  Col,
  Icon,
  MultiColumnList,
  Pane,
  Paneset,
  Row,
  TextArea
} from '@folio/stripes/components';
import GetTrespassReasons from './GetTrespassReasons';
import PutTrespassReasons from './PutTrespassReasons';
import TrespassReasonDetailsPane from './TrespassReasonDetailsPane';
import TrespassReasonEditPane from './TrespassReasonEditPane';
import { v4 as uuidv4 } from 'uuid';
import { useIncidents } from '../contexts/IncidentContext';

const TrespassReasonsPaneset = ({...props}) => {
  const history = useHistory();
  const { pathname } = useLocation();
  const { 
    trespassReasons
  } = useIncidents();

  const [trespassReasonsList, setTrespassReasonsList] = useState([]);
  const listRoute = '/settings/incidents/trespass-reasons';
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    if (pathname === listRoute) {
      setReloadKey(key => key + 1) // guarantee fresh GET
    }
  }, [pathname]);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [formattedTrespassReasons, setFormattedTrespassReasons] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    reason: ''
  });

  const sortTRlist = (trConfigList = []) => {
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    return [...trConfigList].sort((a, b) => {
      const aStr = (a?.reason ?? '').trim();
      const bStr = (b?.reason ?? '').trim();
      return collator.compare(aStr, bStr);
    });
  };

  useEffect(() => {
    const sortedTRlist = sortTRlist(trespassReasons);
    // console.log("sortedTRlist --> ", JSON.stringify(sortedTRlist, null, 2))
    setTrespassReasonsList(sortedTRlist)
  }, [trespassReasons])

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'isDefault') {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };
  };

  const resetForFreshFormInput = () => {
    setFormData({
      id: '',
      reason: ''
    })
  };

  const makeTrespassReasonObject = () => {
    return {
      id: uuidv4(),
      reason: formData.reason,
      ...(formData.isDefault ? { isDefault: true } : {})
    }
  };

  const handleSaveAndClose = () => {
    const newTrespassReason = makeTrespassReasonObject();
    let updatedTrespassReasonsList = [];

    // handle can only be one TR w/ isDefault: true
    if (newTrespassReason.isDefault) {
      const removedPrevDefaultList = trespassReasons.map((tr) => {
        const { isDefault, ...otherKeys } = tr;
        return otherKeys;
      });
      updatedTrespassReasonsList = [...removedPrevDefaultList, newTrespassReason];
    } else {
      updatedTrespassReasonsList = [...trespassReasons, newTrespassReason]
    };

    const readyFormattedData = {
      value: {
        trespassReasons: updatedTrespassReasonsList
      }
    };

    setFormattedTrespassReasons({ data: readyFormattedData })
    resetForFreshFormInput();
  };

  const handleCloseDetails = () => {
    history.push(`/settings/incidents/trespass-reasons`);
  };

  const handleShowDetails = (event, row) => {
    const id = row.id
    history.push(`/settings/incidents/trespass-reasons/${id}`);
  };

  const handleShowEdit = (reasonsId) => {
    history.push(`/settings/incidents/trespass-reasons/${reasonsId}/edit`);
  };

  const handleCancelEdit = (reasonsId) => {
    history.push(`/settings/incidents/trespass-reasons/${reasonsId}`);
  };

  const handleCloseEdit = (reasonsId) => {
    history.push(`/settings/incidents/trespass-reasons/${reasonsId}`);
  };

  const getValidationResults = () => {
    const isReasonNotEmpty = formData.reason && formData.reason.trim() !== '';
    return isReasonNotEmpty
  };

  useEffect(() => {
    setIsButtonDisabled(!getValidationResults())
  }, [formData]);

  const columnWidths = {
    reason: '275px',
    isDefault: '80px'
  };

  const formatter = {
    reason: (item) => {
      if (item.reason?.length > 48) {
        return item.reason.slice(0, 72) + "...";
      } else {
        return item.reason;
      }
    },
    isDefault: (item) => {
      const isDefault = item.isDefault;
      return isDefault ? <span style={{ color: 'green' }}>
        <Icon icon='check-circle'></Icon>
      </span>
        : null
    },
    isSuppressed: (item) => {
      const isSuppressed = item.isSuppressed;
       return isSuppressed ? <span>
        <Icon 
          size='small' 
          icon='exclamation-circle' 
          status='warn'>
        </Icon>
      </span>
        : null
    }
  };

  return (
    <Paneset>
      <Pane
        defaultWidth="fill"
        paneTitle={<FormattedMessage 
          id="settings.trespass-reasons-paneTitle"/>
        }
      >
        <GetTrespassReasons key={reloadKey} reloadKey={reloadKey}/>

        {formattedTrespassReasons && 
          <PutTrespassReasons 
            data={formattedTrespassReasons}
            onSuccess={() => {
              setFormattedTrespassReasons(null); // unmount this component
              setReloadKey(key => key + 1);  // force fresh GET
            }}
            />}

        <Row>
          <Col xs={12}>
           <MultiColumnList 
            contentData={trespassReasonsList ?? []}
            visibleColumns={[
              'reason',
              'isDefault',
              'isSuppressed'
            ]}
            columnMapping={{
              reason: <FormattedMessage id="settings.trespass-reasons.column-mapping-reason"/>,
              isDefault: <FormattedMessage id="settings.trespass-reasons.column-mapping-default"/>,
              isSuppressed: <FormattedMessage id="settings.trespass-reasons.column-mapping-isSuppressed"/>
            }}
            columnWidths={columnWidths}
            formatter={formatter}
            onRowClick={handleShowDetails}
          />
          </Col>
        </Row>

        <Row style={{ marginTop: '45px' }}>
          <Col xs={8}>
            <TextArea 
              required
              label={<FormattedMessage id="settings.trespass-reason-textarea-reason"/>}
              name='reason'
              value={formData.reason}
              onChange={handleChange} 
            />
          </Col>
        </Row>

        <Row>
          <Col xs={6}>
            <Checkbox 
              label={<FormattedMessage id="settings.trespass-reason-checkbox-isDefault"/>}
              name='isDefault'
              checked={formData.isDefault}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <Row style={{ marginTop: '20px', marginBottom: '25px'}}>
          <Col xs={4}>
            <Button
              buttonStyle='primary'
              disabled={isButtonDisabled}
              onClick={handleSaveAndClose}
            >
              <FormattedMessage 
                id="save-and-close-button"
                />
            </Button>
          </Col>
        </Row>
      </Pane>

       <Switch>
        <Route 
          exact
          path="/settings/incidents/trespass-reasons/:id"
          render={(props) => (
            <TrespassReasonDetailsPane 
              {...props} 
              handleCloseDetails={handleCloseDetails} 
              handleShowEdit={handleShowEdit}
              />
          )}/>
        <Route 
          exact
          path="/settings/incidents/trespass-reasons/:id/edit"
          render={(props) => (
            <TrespassReasonEditPane 
              handleCancelEdit={handleCancelEdit}
              handleCloseEdit={handleCloseEdit}
              {...props} 
              />
          )}/>
      </Switch>
    </Paneset>
  )
};

export default TrespassReasonsPaneset; 