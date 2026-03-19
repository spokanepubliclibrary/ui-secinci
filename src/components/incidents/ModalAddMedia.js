import React, { useState, useRef } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  Button,
  Col,
  MessageBanner,
  Modal,
  Pane,
  Paneset,
  ModalFooter,
  Row,
  TextField,
} from '@folio/stripes/components';
import css from './ModalStyle.css';
import { useIncidents } from '../../contexts/IncidentContext';
import { fileTypeFromBuffer } from 'file-type';

const ModalAddMedia = ({ handleAddMedia, handleAddMediaAtCreate, context }) => {
  const fileInputRef = useRef(null);
  const {
    isModalMedia,
    closeModalMedia,
    setIdForMediaCreate,
    setFormDataArrayForMediaCreate,
  } = useIncidents();
  const [showBanner, setShowBanner] = useState(false);
  const [validFile, setValidFile] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mediaDataForm, setMediaDataForm] = useState({
    description: '',
    file: null,
    contentType: '',
    filePreviewUrl: null
  });
  const MAX_SIZE_IMAGE_OR_PDF = 10 * 1024 * 1024; // 10 MB
  const MAX_SIZE_VIDEO = 100 * 1024 * 1024; // 100 MB

  if (!isModalMedia) {
    return null;
  };

  const resetFileState = () => {
    setMediaDataForm((prev) => ({
      ...prev,
      description: '',
      file: null,
      contentType: '',
      filePreviewUrl: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    };
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setMediaDataForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  };

  const isFileSizeValid = (mime, size) => {
    // if video/ type allow up to 100MB, else 10MB
    if (mime.startsWith('video/')) {
      return size <= MAX_SIZE_VIDEO;
    } else {
      return size <= MAX_SIZE_IMAGE_OR_PDF
    }
  };

  const bytesToMB = (bytes) => {
    const megabytes = bytes / (1024 * 1024); 
    return megabytes.toFixed(1);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return; 

    setShowBanner(false);
    setValidFile(false);

    try {
      // read small chunk of file for signature detection
      const chunk = file.slice(0, 4100);
      // read and return promise 
      const arrayBuffer = await chunk.arrayBuffer();
      // make byte-level view of raw data
      const buffer = new Uint8Array(arrayBuffer);
      // get detected type
      const detectedType = await fileTypeFromBuffer(buffer);

      // return if !detectedType
      if (!detectedType) {
        setErrorMessage(<FormattedMessage id="modal-add-media-error-msg-unrecognized"/>);
        setShowBanner(true);
        resetFileState();
        return;
      };

      const { ext, mime } = detectedType;
      const validExtensions = ['pdf', 'mp4', 'mpeg', 'jpeg', 'jpg', 'png'];

      // check allowed extensions
      if (!validExtensions.includes(ext)) {
        console.log(`The ext: ${ext}`)
        setErrorMessage(<FormattedMessage 
          id="modal-add-media-error-msg-ext-not-allowed"
          values={{ ext }}
        />);
        setShowBanner(true);
        resetFileState();
        return; 
      };

      // check if file size is acceptable 
      if (!isFileSizeValid(mime, file.size)) {
        const fileSize = bytesToMB(file.size);
        setErrorMessage(<FormattedMessage 
          id="modal-add-media-error-msg-file-too-large"
          values={{ mime, fileSize }}
        />);
        setShowBanner(true);
        resetFileState();
        return; 
      };

      // work with valid file from here
      setValidFile(true);

      // make preview
      let filePreviewUrl = null;
      if (mime.startsWith('image/')) {
        filePreviewUrl = URL.createObjectURL(file);
      } else if (mime.startsWith('video/')) {
        filePreviewUrl = 'isVideo';
      } else if (mime === 'application/pdf') {
        filePreviewUrl = 'isPdf'
      };

      // update state 
      setMediaDataForm((prev) => ({
        ...prev,
        file,
        contentType: mime,
        filePreviewUrl
      }));
    } catch (error) {
      console.log('error while reading file - error: ', error.message);
      const errorMsg = error.message;
      setErrorMessage(<FormattedMessage 
          id="modal-add-media-error-msg-while-reading-file"
          values={{ errorMsg }}
        />)
      setShowBanner(true);
      resetFileState();
    };
  };

  const handleCancel = () => {
    setMediaDataForm({
      description: '',
      file: null,
      contentType: ''
    });
    setIdForMediaCreate(null);
    setFormDataArrayForMediaCreate(null);
    setShowBanner(false);
    setValidFile(false);
    closeModalMedia();
  };

  const isFormDataPresent = () => {
    const { description } = mediaDataForm;
    return description.trim() !== '' && validFile
  };

  const handleSave = () => {
    if (context === 'create') {
      handleAddMediaAtCreate(mediaDataForm)
    } else if (context === 'edit') {
      handleAddMedia(mediaDataForm)
    };
    resetFileState();
    setShowBanner(false);
    setValidFile(false);
    closeModalMedia();
  };

  const footer = (
    <ModalFooter>
      <Button
        onClick={handleSave}
        buttonStyle="primary"
        disabled={!isFormDataPresent()}
        marginBottom0
      >
        <FormattedMessage id="close-continue-button" />
      </Button>
      <Button onClick={handleCancel}>
        <FormattedMessage id="cancel-button" />
      </Button>
    </ModalFooter>
  );

  return (
    <Modal
      style={{ 
        minHeight: '550px',
        height: '80%', // allows modal to grow/shrink based on content
        maxHeight: '300vh',  // modal will never exceed 90% of viewport height
        maxWidth: '300vw', // modal width responsive to viewport width
        width: '60%' // modal width adjusts based on content and window size
      }}
      open
      dismissible
      closeOnBackgroundClick
      label={<FormattedMessage id="modal-add-media-label-add-media-file" />}
      size="large"
      onClose={handleCancel}
      footer={footer}
      contentClass={css.modalContent}
    >
      <Paneset>
        <Pane
          defaultWidth='fill'
        >
          <Row>
            <Col xs={5}>
              <TextField
                onChange={handleChange}
                value={mediaDataForm.description}
                name="description"
                label={
                  <FormattedMessage id="modal-add-media-textField-description-media-file" />
                }
              />
            </Col>
          </Row>
          <Row>
            <Col xs={6}>
              <input type="file" onChange={handleFileChange} ref={fileInputRef}/>
            </Col>
          </Row>
          <Row style={{ marginTop: '25px' }}>
            <Col xs={8}>
                <MessageBanner 
                  dismissible
                  type='error'
                  show={showBanner}>
                  {errorMessage || <FormattedMessage id="modal-add-media-error-msg-default"/>}
                </MessageBanner>
            </Col>
          </Row>
        </Pane>
      </Paneset>
    </Modal>
  );
};

export default ModalAddMedia;