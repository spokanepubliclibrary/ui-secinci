/* 
  -get category title by id for associated key rendering
  @param {Array} categoriesList - array of categories 
  @param {str} catId - string of the category id
  @returns {str} - if match, returns str of the category title, else returns str 'Unknown category'
*/
const getCategoryTitleById = (categoriesList, catId) => {
  if (!Array.isArray(categoriesList) || !catId) return '';
  const category = categoriesList.find(cat => cat.id === catId);
  return category ? category.title : 'Unknown category'; 
};

export default getCategoryTitleById; 