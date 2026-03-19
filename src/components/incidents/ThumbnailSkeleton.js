
import React from 'react';
import { Loading } from '@folio/stripes/components';
import { 
  thumbnailContainerStyle, 
  buttonStyle
} from './ThumbnailStyles';
const ThumbnailSkeleton = () => {
  return (
    <>
    <div style={thumbnailContainerStyle}>
      
      <div style={{ marginTop: '45px'}}>
        <Loading size ='large'/>
      </div>

      <div style={{ marginTop: '50px'}}>
        <Loading size ='medium'/>
      </div>

      <div style={{ marginTop: '40px'}}>
        <Loading size ='medium' style={buttonStyle}/>
      </div>

    </div>
    </>
  );
};

export default ThumbnailSkeleton;