import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { Col, Loading, Modal, Row } from '@folio/stripes/components';
import { useIncidents } from '../../contexts/IncidentContext';
import GetMedia from './GetMedia';

const ModalViewMedia = ({ modalViewImageData }) => {
  const { isModalViewImage, closeModalViewImage } = useIncidents();
  const { id, imageId, alt, contentType, imageDescription} = modalViewImageData;
  const [mediaUrl, setMediaUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  if (!isModalViewImage) {
    return null;
  };

  const handleDataResponse = (url) => {
    setMediaUrl(url)
    setIsLoading(false)
  };
 
  const isVideo = contentType.startsWith('video');

  const handleDismissClose = () => {
    closeModalViewImage();
  };

  return (
    <Modal
      style={{ 
        minHeight: '550px',
        height: '60%', // allows modal to grow/shrink based on content
        maxHeight: '300vh',  // modal will never exceed 90% of viewport height
        maxWidth: '400vw', // modal width responsive to viewport width
        width: '80%' // modal width adjusts based on content and window size
      }}
      open
      dismissible
      closeOnBackgroundClick
      label={imageDescription}
      size="large"
      onClose={handleDismissClose}
    >
      {id && imageId && 
        <GetMedia 
          context='original-or-video'
          id={id} 
          imageId={imageId} 
          handleDataResponse={handleDataResponse}
        />}

      {isLoading ? (
        <Row style={{ display: 'flex', justifyContent: 'center', marginTop: "150px"}}>
          <Col>
          <div style={{ "display": "flex", "justiftContent": "center", "aligItems": "center", "height": "100%" }}>
            <Loading size='large'/>
          </div>
          </Col>
        </Row>
        ) : ( 
        <Row style={{ display: 'flex', justifyContent: 'center' }}>
        <Col xs={8} style={{ textAlign: 'center' }}>
          {isVideo ? (
            mediaUrl && <video 
              width="650" 
              height="auto" 
              controls controlsList="nodownload" // do not render download option
              oncontextmenu="return false;" // prevent right click download option
              >
                <source src={mediaUrl} type={contentType}></source>
                <FormattedMessage id="video-player-default-text" />
            </video>          
          ) : (mediaUrl && <img
            src={mediaUrl}
            alt={alt}
            style={{ width: '550px', margin: 'auto' }}
            className="img-fluid"
          />)}
        </Col>
      </Row>
      )}
    </Modal>
  );
};

export default ModalViewMedia;