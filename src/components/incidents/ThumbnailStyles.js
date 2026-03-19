
export const thumbnailContainerStyle = {
  width: '120px', // Ensure enough space for padding and internal content
  borderRadius: '4px',
  margin: '10px',
  textAlign: 'center',
  // border: '1px solid #ccc',
  boxSizing: 'border-box', // Ensure padding is included within the width
  padding: '10px',
  display: 'flex',
  flexDirection: 'column', // Stack elements vertically
  alignItems: 'center' // Center content within the container
};

export const thumbnailStyle = {
  width: '100px', 
  height: 'auto', 
  objectFit: 'cover',
  maxWidth: '100%', // Ensure it stays within the container
};

export const thumbnailTextStyle = {
  maxWidth: '100px',
  overflow: 'hidden',
  height: '4.4em', // 2 lines of height
  margin: '5px 0',
  textAlign: 'center',
  lineHeight: '1.2em', // Each line is 1.2 times the font size
  whiteSpace: 'normal',
  display: 'block', // Ensure block-level for multi-line text
  textOverflow: 'ellipsis', // Add ellipsis if the text exceeds 2 lines
};

export const buttonContainerStyle = {
  marginTop: '10px',
  textAlign: 'center',
  width: '100%', // Ensure the button spans the width of the container
  display: 'flex',
  justifyContent: 'center', // Center the button horizontally
};

export const buttonStyle = {
  marginTop: '-10px',
  maxWidth: '100%', // Ensure the button doesn't exceed container width
  padding: '5px 10px', // Add some padding for visual appeal
  whiteSpace: 'nowrap', // Prevent text from wrapping to the next line
  overflow: 'hidden', // Hide any overflowed content
  textOverflow: 'ellipsis', // Show an ellipsis if the text is too long
};