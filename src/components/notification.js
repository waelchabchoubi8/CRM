import React from 'react';

const Notification = ({ message, onClick }) => {
  return (
    <div className="notification" onClick={onClick}>
      {message}
    </div>
  );
};

export default Notification;
