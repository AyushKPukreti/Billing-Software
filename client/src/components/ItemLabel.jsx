import React from "react";

const ItemLabel = ({ index, description }) => {
  const truncateText = (text, limit = 20) => {
    if (!text) return "";
    return text.length > limit ? text.substring(0, limit) + "..." : text;
  };
  
  return (
    <span className="font-medium">
      Item {index + 1}: {truncateText(description)} 
    </span>
  );
};

export default ItemLabel;
