import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';
import {
  AccordionSet,
  Accordion,
  Button,
  Checkbox,
  Col,
  LoadingPane,
  Pane,
  Row,
  TextArea
} from '@folio/stripes/components';
import GetTrespassReasons from './GetTrespassReasons';
import PutTrespassReasons from './PutTrespassReasons';
import { useIncidents } from '../contexts/IncidentContext';

const TrespassReasonEditPane = ({handleCancelEdit, handleCloseEdit, ...props}) => {
  const { id } = useParams();
  const { 
    trespassReasons
  } = useIncidents();

  const [formattedTrespassReasons, setFormattedTrespassReasons] = useState(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [trIsLoading, setTrIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    reason: '',
    isDefault: false,
    isSuppressed: false
  });

  // useEffect(() => {
  //   console.log("formData --> ", JSON.stringify(formData, null, 2))
  // }, [formData]);

  useEffect(() => {
    if (trespassReasons && trespassReasons.length > 0) {
      const foundTR = trespassReasons.find((tr) => tr.id === id);
      if (foundTR) {
        setFormData({
          id: foundTR.id,
          reason: foundTR.reason || '', 
          ...(foundTR.isDefault ? {isDefault: foundTR.isDefault} : {}),
          ...(foundTR.isSuppressed ? {isSuppressed: foundTR.isSuppressed} : {})
        });
      } else {
        console.error(`trespass reason with id ${id} not found`);
        setFormData({
          id: '',
          reason: '',
        });
      };
    };
  }, [id, trespassReasons]);

  const handleChange = (event) => {
    const { name, value } = event.target
    if (name === 'isDefault') {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked
      }));
    } else if (name === 'isSuppressed') {
      setFormData((prev) => ({
        ...prev,
        [name]: event.target.checked
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    };
  };

  const handleFinishEdit = () => {
    setTrIsLoading(false);
    handleCloseEdit(id);
  };

  const stripFalseFlags = (tr, keys = ['isDefault', 'isSuppressed']) => {
    const out = { ...tr };
    for (const k of keys) {
      if (out[k] === false) delete out[k];
      else if (out[k] === true) out[k] = true; // normalize to literal true
    }
    return out; 
  };

  const handleEditSaveAndClose = () => {
    const newTR = {
      id: formData.id,
      reason: formData.reason,
      isSuppressed: !!formData.isSuppressed,
      isDefault: formData.isSuppressed ? false : !!formData.isDefault,
    };

    const upsertById = (list, item) => {
      let found = false;
      const replaced = list.map(tr => {
        if (tr.id === item.id) {
          found = true;
          return { ...tr, ...item };
        }
        return tr; 
      });
      return found ? replaced : [...replaced, item];
    };

    let next = upsertById(trespassReasons, newTR);

    // no suppressed item can be default
    next = next.map(tr => (tr.isSuppressed ? { ...tr, isDefault: false} : tr));

    // ensure single isDefault (having a default is not required)
    if (newTR.isDefault) {
      next = next.map(tr => tr.id === newTR.id ? tr : { ...tr, isDefault: false }
      );
    };

    // remove false flags (no persist isDefault: false, isSuppressed: false, only persist if true)
    next = next.map(tr => stripFalseFlags(tr, ['isDefault', 'isSuppressed']));

    const readyFormattedData = {
      value: { trespassReasons: next }
    };

    // console.log("ON SAVE, pre data key -> ", JSON.stringify(readyFormattedData, null, 2))

    // triggers <PutTrespassReasons />
    setFormattedTrespassReasons({ data: readyFormattedData })
  };

  useEffect(() => {
    const isReasonNotEmpty = formData.reason && formData.reason.trim() !== '';
    const isValid = isReasonNotEmpty;
    setIsButtonDisabled(!isValid);
  }, [formData]);

  return (
   <>
    <GetTrespassReasons />

    {formattedTrespassReasons && 
      <PutTrespassReasons 
        data={formattedTrespassReasons}
        handleFinishEdit={handleFinishEdit}
        />}

   {trIsLoading ? (
    <LoadingPane defaultWidth='100%'/>
   ) : (
     <Pane
      dismissible
      onClose={() => handleCancelEdit(id)}
      defaultWidth="100%"
      paneTitle={<FormattedMessage 
        id="settings.trespass-reasons-paneTitle"/>
      }
      {...props}>

      <AccordionSet>
        <Accordion label={<FormattedMessage 
          id="details-pane.accordion-label.details"/>}
        >
          <Row>
            <Col xs={8}>
              <TextArea
                required
                label={<FormattedMessage id="settings.trespass-document-edit-textfield-reason-label"/>}
                name='reason'
                value={formData.reason}
                onChange={handleChange} 
              />
            </Col>
          </Row>
           <Row>
            <Col xs={6}>
              <Checkbox 
                label={<FormattedMessage id="settings.trespass-document-edit-checkbox-default-label"/>}
                name='isDefault'
                checked={formData.isDefault}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <Checkbox 
                label={<FormattedMessage id="settings.trespass-document-edit-checkbox-suppress-label"/>}
                name='isSuppressed'
                checked={formData.isSuppressed}
                onChange={handleChange}
              />
            </Col>
          </Row>
          <Row style={{ marginTop: '20px', marginBottom: '25px'}}>
            <Col xs={4}>
              <Button
                buttonStyle='primary'
                disabled={isButtonDisabled}
                onClick={handleEditSaveAndClose}
              >
                  <FormattedMessage 
                    id="save-and-close-button"
                    />
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

export default TrespassReasonEditPane; 